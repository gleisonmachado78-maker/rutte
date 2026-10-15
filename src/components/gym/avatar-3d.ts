import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { SEG } from '@/lib/exercise-motion';
import { U, type Skel3 } from '@/lib/exercise-3d';

/**
 * Personagem realista (modelos do repositório oficial do three.js: homem = avatar Ready Player Me, mulher = Michelle).
 * A cada quadro, cada osso é "apontado" para as articulações do esqueleto do exercício (mesmo
 * movimento do boneco), então o modelo faz exatamente o exercício escolhido.
 */
export type AvatarKind = 'masculino' | 'feminino';
const FILE: Record<AvatarKind, string> = { masculino: 'models/Homem.glb', feminino: 'models/Michelle.glb' };

const cache = new Map<AvatarKind, Promise<THREE.Group>>();
function loadModel(kind: AvatarKind): Promise<THREE.Group> {
  if (!cache.has(kind)) {
    const url = `${import.meta.env.BASE_URL}${FILE[kind]}`;
    cache.set(
      kind,
      new Promise((resolve, reject) => {
        new GLTFLoader().load(
          url,
          (gltf) => {
            // deixa o modelo na pose T (bind) antes de guardar
            const tpose = gltf.animations.find((a) => /t-?pose/i.test(a.name));
            if (tpose) {
              const mixer = new THREE.AnimationMixer(gltf.scene);
              mixer.clipAction(tpose).play();
              mixer.update(0);
            }
            gymOutfit(gltf.scene, kind);
            resolve(gltf.scene);
          },
          undefined,
          reject,
        );
      }),
    );
    cache.get(kind)!.catch(() => cache.delete(kind));
  }
  return cache.get(kind)!;
}

// nomes dos ossos sem o prefixo "mixamorig" (a Michelle tem o prefixo; o avatar do homem, não)
const P = '';

/** Roupa de academia: camiseta de treino, calça/legging escura e tênis branco (e sem chapéu). */
function gymOutfit(scene: THREE.Object3D, kind: AvatarKind) {
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    if (/Headwear/i.test(m.name)) {
      m.visible = false; // tira o chapéu
      return;
    }
    const mat = m.material as THREE.MeshStandardMaterial;
    const paint = (hex: string, rough = 0.75) => {
      mat.map = null;
      mat.color = new THREE.Color(hex);
      mat.roughness = rough;
      mat.metalness = 0;
      mat.needsUpdate = true;
    };
    if (/Outfit_Top/i.test(m.name)) paint('#c62828', 0.7); // camiseta dry-fit vermelha
    else if (/Outfit_Bottom/i.test(m.name)) paint('#1d2333', 0.85); // calça de treino escura
    else if (/Outfit_Footwear/i.test(m.name)) paint('#eef1f5', 0.5); // tênis branco
    else if (kind === 'feminino' && mat.map?.image) {
      // Michelle: troca a calça amarela da textura por legging escura
      const img = mat.map.image as CanvasImageSource & { width: number; height: number };
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      const px = data.data;
      for (let i = 0; i < px.length; i += 4) {
        const [rr, gg, bb] = [px[i] / 255, px[i + 1] / 255, px[i + 2] / 255];
        const max = Math.max(rr, gg, bb);
        const min = Math.min(rr, gg, bb);
        const sat = max ? (max - min) / max : 0;
        // amarelo: vermelho e verde altos, azul baixo
        if (sat > 0.35 && max > 0.25 && rr > bb * 1.4 && gg > bb * 1.3 && Math.abs(rr - gg) < 0.28) {
          const light = (rr + gg + bb) / 3; // mantém dobras e sombras do tecido
          px[i] = 22 + light * 40;
          px[i + 1] = 26 + light * 44;
          px[i + 2] = 40 + light * 60;
        }
      }
      ctx.putImageData(data, 0, 0);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = mat.map.colorSpace;
      tex.flipY = mat.map.flipY;
      tex.wrapS = mat.map.wrapS;
      tex.wrapT = mat.map.wrapT;
      mat.map = tex;
      mat.needsUpdate = true;
    }
  });
}
const NAMES = {
  hips: `${P}Hips`,
  spine: `${P}Spine`,
  spine1: `${P}Spine1`,
  spine2: `${P}Spine2`,
  neck: `${P}Neck`,
  head: `${P}Head`,
  lArm: `${P}LeftArm`,
  lFore: `${P}LeftForeArm`,
  lHand: `${P}LeftHand`,
  rArm: `${P}RightArm`,
  rFore: `${P}RightForeArm`,
  rHand: `${P}RightHand`,
  lUp: `${P}LeftUpLeg`,
  lLeg: `${P}LeftLeg`,
  lFoot: `${P}LeftFoot`,
  lToe: `${P}LeftToeBase`,
  rUp: `${P}RightUpLeg`,
  rLeg: `${P}RightLeg`,
  rFoot: `${P}RightFoot`,
  rToe: `${P}RightToeBase`,
} as const;
type BoneKey = keyof typeof NAMES;

const tmpQ = new THREE.Quaternion();
const tmpQ2 = new THREE.Quaternion();
const tmpV = new THREE.Vector3();
const tmpV2 = new THREE.Vector3();
const UPV = new THREE.Vector3(0, 1, 0);

function basis(up: THREE.Vector3, left: THREE.Vector3) {
  const y = up.clone().normalize();
  const x = left.clone().sub(y.clone().multiplyScalar(left.dot(y))).normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  return new THREE.Matrix4().makeBasis(x, y, z);
}

export class Avatar {
  group = new THREE.Group();
  private bones = {} as Record<BoneKey, THREE.Bone>;
  private restHipsQ = new THREE.Quaternion();
  private restBasisInv = new THREE.Matrix4();
  private scaleK = 1;
  private L: 0 | 1 = 1;
  private gripOn = false;

  static async create(kind: AvatarKind) {
    const src = await loadModel(kind);
    return new Avatar(cloneSkinned(src) as THREE.Group);
  }

  private constructor(model: THREE.Group) {
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        m.frustumCulled = false;
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        mats.forEach((mt) => {
          const s = mt as THREE.MeshStandardMaterial;
          if ('roughness' in s) s.roughness = Math.max(0.45, s.roughness ?? 0.6);
        });
      }
      const b = o as THREE.Bone;
      if (b.isBone) {
        const plain = b.name.replace(/^mixamorig:?/, '');
        const key = (Object.keys(NAMES) as BoneKey[]).find((k) => NAMES[k] === plain);
        if (key) this.bones[key] = b;
      }
    });
    this.group.add(model);
    model.updateMatrixWorld(true);

    const w = (k: BoneKey) => this.bones[k].getWorldPosition(new THREE.Vector3());
    // escala: comprimento da perna do modelo = perna do esqueleto do exercício
    const legModel = w('lUp').distanceTo(w('lLeg')) + w('lLeg').distanceTo(w('lFoot'));
    this.scaleK = ((SEG.thigh + SEG.shin) * U) / legModel;
    model.scale.multiplyScalar(this.scaleK);
    model.updateMatrixWorld(true);

    // referencial do quadril em repouso (cima = coluna, esquerda = quadril esquerdo)
    this.bones.hips.getWorldQuaternion(this.restHipsQ);
    const restUp = w('neck').sub(w('hips'));
    const restLeft = w('lUp').sub(w('rUp'));
    this.restBasisInv = basis(restUp, restLeft).invert();
  }

  /** Gira o osso para que a direção dele até o filho aponte para "dir" (no mundo). */
  private aim(key: BoneKey, child: BoneKey, dir: THREE.Vector3) {
    const bone = this.bones[key];
    const kid = this.bones[child];
    if (!bone || !kid || dir.lengthSq() < 1e-8) return;
    bone.parent!.updateWorldMatrix(true, false);
    const parentQ = bone.parent!.getWorldQuaternion(tmpQ);
    const worldQ = tmpQ2.copy(parentQ).multiply(bone.quaternion);
    const cur = tmpV.copy(kid.position).normalize().applyQuaternion(worldQ);
    const delta = new THREE.Quaternion().setFromUnitVectors(cur, tmpV2.copy(dir).normalize());
    const newWorld = delta.multiply(worldQ);
    bone.quaternion.copy(parentQ.invert().multiply(newWorld));
  }

  update(s: Skel3) {
    const b = this.bones;
    if (!b.hips) return;
    // qual lado do esqueleto é a esquerda do personagem (frente = para onde apontam os pés)
    // Lado: o desenho de perfil sempre mostra o lado direito da pessoa (índice 0 = direita);
    // de frente, a pessoa olha para a câmera (índice 0 = esquerda). Regra fixa, vale para deitado também.
    const midSh = s.shoulders[0].clone().add(s.shoulders[1]).multiplyScalar(0.5);
    const up = midSh.clone().sub(s.hip);
    const L: 0 | 1 = s.view === 'side' ? 1 : 0;
    const R = (1 - L) as 0 | 1;
    this.L = L;

    // quadril: posição + orientação (cima e esquerda do esqueleto)
    const hipsPos = s.hips[0].clone().add(s.hips[1]).multiplyScalar(0.5);
    b.hips.parent!.updateWorldMatrix(true, false);
    b.hips.position.copy(b.hips.parent!.worldToLocal(hipsPos.clone()));
    const left = s.hips[L].clone().sub(s.hips[R]);
    const rot = new THREE.Quaternion().setFromRotationMatrix(basis(up, left).multiply(this.restBasisInv));
    const parentQ = b.hips.parent!.getWorldQuaternion(new THREE.Quaternion());
    b.hips.quaternion.copy(parentQ.invert().multiply(rot.multiply(this.restHipsQ)));

    // coluna, pescoço e cabeça
    const spineDir = s.neck.clone().sub(s.hip);
    this.aim('spine', 'spine1', spineDir);
    this.aim('spine1', 'spine2', spineDir);
    this.aim('spine2', 'neck', spineDir);
    this.aim('neck', 'head', s.head.clone().sub(s.neck));

    // braços e pernas
    for (const [side, i] of [['l', L], ['r', R]] as const) {
      const k = (n: string) => `${side}${n}` as BoneKey;
      this.aim(k('Arm'), k('Fore'), s.elbows[i].clone().sub(s.shoulders[i]));
      this.aim(k('Fore'), k('Hand'), s.hands[i].clone().sub(s.elbows[i]));
      this.aim(k('Up'), k('Leg'), s.knees[i].clone().sub(s.hips[i]));
      this.aim(k('Leg'), k('Foot'), s.ankles[i].clone().sub(s.knees[i]));
      // o pé acompanha a canela na posição natural (apontar o pé girava o tênis de lado)
    }
  }

  /** Onde estão as mãos do personagem (na ordem do esqueleto), para a barra/halteres ficarem nelas. */
  handPositions(): [THREE.Vector3, THREE.Vector3] | null {
    const { lHand, rHand, lFore, rFore } = this.bones;
    if (!lHand || !rHand || !lFore || !rFore) return null;
    this.group.updateMatrixWorld(true);
    // o osso da mão fica no punho: avança até o meio da palma, na direção do antebraço
    const palm = (hand: THREE.Bone, fore: THREE.Bone) => {
      const h = hand.getWorldPosition(new THREE.Vector3());
      const fo = fore.getWorldPosition(new THREE.Vector3());
      return h.clone().add(h.clone().sub(fo).normalize().multiplyScalar(0.42));
    };
    const l = palm(lHand, lFore);
    const r = palm(rHand, rFore);
    const out: [THREE.Vector3, THREE.Vector3] = this.L === 1 ? [r, l] : [l, r];
    return out;
  }

  /** Fecha os dedos em volta da barra/halter (pegada). */
  grip(on: boolean) {
    if (this.gripOn === on) return;
    this.gripOn = on;
    this.group.traverse((o) => {
      const b = o as THREE.Bone;
      if (!b.isBone) return;
      const n = b.name.replace(/^mixamorig:?/, '');
      const m = n.match(/^(Left|Right)Hand(Index|Middle|Ring|Pinky|Thumb)([123])$/);
      if (!m) return;
      if (!b.userData.rest) b.userData.rest = b.quaternion.clone();
      const rest = b.userData.rest as THREE.Quaternion;
      if (!on) {
        b.quaternion.copy(rest);
        return;
      }
      const thumb = m[2] === 'Thumb';
      const amount = thumb ? 0.5 : m[3] === '1' ? 1.15 : 1.35;
      // nos esqueletos Mixamo os dedos dobram em volta do eixo Z local (sinal oposto em cada mão)
      const sign = m[1] === 'Left' ? 1 : -1;
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), sign * amount);
      b.quaternion.copy(rest).multiply(q);
    });
  }

  dispose() {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.geometry?.dispose();
    });
  }
}

void UPV;
