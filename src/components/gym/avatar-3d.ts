import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { SEG } from '@/lib/exercise-motion';
import { U, type Skel3 } from '@/lib/exercise-3d';

/**
 * Personagem realista (modelos Mixamo do repositório oficial do three.js: Soldier e Michelle).
 * A cada quadro, cada osso é "apontado" para as articulações do esqueleto do exercício (mesmo
 * movimento do boneco), então o modelo faz exatamente o exercício escolhido.
 */
export type AvatarKind = 'masculino' | 'feminino';
const FILE: Record<AvatarKind, string> = { masculino: 'models/Soldier.glb', feminino: 'models/Michelle.glb' };

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

const P = 'mixamorig';
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
        const key = (Object.keys(NAMES) as BoneKey[]).find((k) => NAMES[k] === b.name.replace(':', ''));
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
    const forward = s.toes[0].clone().sub(s.ankles[0]).add(s.toes[1].clone().sub(s.ankles[1]));
    const midSh = s.shoulders[0].clone().add(s.shoulders[1]).multiplyScalar(0.5);
    const up = midSh.clone().sub(s.hip);
    const right = new THREE.Vector3().crossVectors(forward, up);
    let L: 0 | 1 = 1;
    if (right.lengthSq() > 1e-6) L = s.hips[0].clone().sub(s.hip).dot(right) > 0 ? 1 : 0;
    const R = (1 - L) as 0 | 1;

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
      this.aim(k('Foot'), k('Toe'), s.toes[i].clone().sub(s.ankles[i]));
    }
  }

  dispose() {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.geometry?.dispose();
    });
  }
}

void UPV;
