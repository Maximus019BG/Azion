import * as THREE from "three";
import { useRef, useState } from "react";
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";

export default function Badge2() {
  extend({ MeshLineGeometry, MeshLineMaterial });

  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();

  const { width, height } = useThree((state) => state.size);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);

  const card = useRef();
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const [dragged, drag] = useState(false);

  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useFrame((state) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      card.current.setNextKinematicPosition({
        x: vec.x - dragged,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(j2.current.translation());
    curve.points[2].copy(j1.current.translation());
    curve.points[3].copy(fixed.current.translation());
    band.current.geometry.setPoints(curve.getPoints(32));
  });

  ang.copy(card.current.angvel());
  rot.copy(card.current.rotation());
  card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });

  return (
    <>
      <RigidBody ref={fixed} type="fixed" />

      <RigidBody position={[0.5, 0, 0]} ref={j1}>
        <BallCollider args={[0.1]} />
      </RigidBody>

      <RigidBody position={[1, 0, 0]} ref={j2}>
        <BallCollider args={[0.1]} />
      </RigidBody>

      <RigidBody position={[1.5, 0, 0]} ref={j3}>
        <BallCollider args={[0.1]} />
      </RigidBody>

      <RigidBody ref={card} type={dragged ? 'kinematicPosition': 'dynamic'}>
        <CuboidCollider args={[0.8 * 2, 1.125, 0.01]}/>
        <mesh 
         onPointerUp={(e)=> drag(false)}
         onPointerDown={(e)=> drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))}>

          <planeGeometry args={[0.8 * 2, 1.125 * 2]} />
          <meshBasicMaterial color="white" side={THREE.DoubleSide}/>
        </mesh>
      </RigidBody>

      <PerspectiveCamera makeDefault manual aspect = {1.05} position={[0.49, 0.22, 2]}/>
      <mesh>
        <planeGeometry args={[planeWidth, planeWidth / textureAspect]}/>
        <meshElasicMaterial transparent alphaMap={texture} side={THREE.BackSide} />
      </mesh>

      <mesh geometry={nodeServerAppPaths.card.geometry}>  
        <meshPhongMaterial
          clearcoat= {1}
          clearcoatRoughness= {0.15}
          iridescence = {1}
          iridescenceIOR = {1}
          iridescenceThicknessRange = {[0, 2400]}
          metalness = {0.5}
          roughness = {0.3}
        >
          <RenderTexture attach="map" height={2000} width={2000}>
            <BadgeTexture user={user}/>
          </RenderTexture>
        </meshPhongMaterial>
      </mesh>

      <mesh ref={band}>
        <MeshLineGeometry />
        <MeshLineMaterial
          color="white"
          resolution={[width, height]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}