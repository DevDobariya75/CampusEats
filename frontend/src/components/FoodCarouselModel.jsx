import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export const FOOD_SHOWCASE_ITEMS = [
  {
    label: 'Cheeseburger',
    path: '/animation/Cheeseburger.glb',
    scaleBoost: 0.98,
    rotation: [0.04, 0.02, 0],
  },
  {
    label: 'Cake Chocolate Slice',
    path: '/animation/Cake Chocolate Slice.glb',
    scaleBoost: 0.82,
    rotation: [0.16, -0.76, 0.02],
  },
  {
    label: 'Burrito',
    path: '/animation/Burrito.glb',
    scaleBoost: 1.04,
    rotation: [0.08, 1.02, -0.04],
  },
  {
    label: 'Pizza',
    path: '/animation/Pizza.glb',
    scaleBoost: 1.07,
    rotation: [0.6, -0.28, 0.04],
  },
  {
    label: 'Cookie',
    path: '/animation/Cookie.glb',
    scaleBoost: 1.1,
    rotation: [0.86, 0.12, 0],
  },
  {
    label: 'High Tea',
    path: '/animation/High Tea.glb',
    scaleBoost: 1,
    rotation: [0.24, -0.58, 0],
  },
];

const cloneSceneWithOwnMaterials = (scene) => {
  const clonedScene = scene.clone(true);
  clonedScene.traverse((node) => {
    if (!node.isMesh || !node.material) return;

    if (Array.isArray(node.material)) {
      node.material = node.material.map((material) => material.clone());
      return;
    }

    node.material = node.material.clone();
  });

  return clonedScene;
};

const setSceneOpacity = (scene, opacity) => {
  scene.traverse((node) => {
    if (!node.isMesh || !node.material) return;

    const applyOpacity = (material) => {
      material.transparent = opacity < 0.999;
      material.opacity = opacity;
      material.depthWrite = opacity > 0.96;
      material.needsUpdate = true;
    };

    if (Array.isArray(node.material)) {
      node.material.forEach(applyOpacity);
      return;
    }

    applyOpacity(node.material);
  });
};

export default function FoodCarouselModel({ activeIndex = 0, ...props }) {
  const rootRef = useRef(null);
  const variantRefs = useRef([]);
  const transitionRef = useRef({
    previous: 0,
    current: 0,
    mix: 1,
  });

  const gltfs = useLoader(
    GLTFLoader,
    FOOD_SHOWCASE_ITEMS.map((item) => item.path)
  );

  const preparedModels = useMemo(() => {
    return gltfs.map((gltf, index) => {
      const scene = cloneSceneWithOwnMaterials(gltf.scene);
      const bounds = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();

      bounds.getCenter(center);
      bounds.getSize(size);

      const maxDimension = Math.max(size.x, size.y, size.z) || 1;
      const fitScale = 5.5 / maxDimension;

      setSceneOpacity(scene, index === 0 ? 1 : 0);

      return {
        item: FOOD_SHOWCASE_ITEMS[index],
        scene,
        center,
        fitScale,
      };
    });
  }, [gltfs]);

  useEffect(() => {
    if (!preparedModels.length) return;

    const validIndex = ((activeIndex % preparedModels.length) + preparedModels.length) % preparedModels.length;
    const transitionState = transitionRef.current;

    if (validIndex === transitionState.current) return;

    transitionState.previous = transitionState.current;
    transitionState.current = validIndex;
    transitionState.mix = 0;
  }, [activeIndex, preparedModels.length]);

  useFrame((state, delta) => {
    const root = rootRef.current;
    if (!root || !preparedModels.length) return;

    const transitionState = transitionRef.current;
    transitionState.mix = Math.min(1, transitionState.mix + delta * 1.25);

    const easedMix = 1 - Math.pow(1 - transitionState.mix, 3);
    const now = state.clock.getElapsedTime();

    const targetX = Math.sin(now * 0.75) * 0.08;
    const targetY = -0.12 + Math.sin(now * 1.2) * 0.08;
    const targetZ = Math.cos(now * 0.6) * 0.1;
    const targetRotY = 0.22 + Math.sin(now * 0.45) * 0.12;
    const targetRotX = 0.06 + Math.sin(now * 0.95) * 0.04;

    root.position.x += (targetX - root.position.x) * 0.08;
    root.position.y += (targetY - root.position.y) * 0.08;
    root.position.z += (targetZ - root.position.z) * 0.08;

    root.rotation.y += (targetRotY - root.rotation.y) * 0.08;
    root.rotation.x += (targetRotX - root.rotation.x) * 0.08;

    const currentIndex = transitionState.current;
    const currentModel = preparedModels[currentIndex];

    const currentRef = variantRefs.current[currentIndex];

    preparedModels.forEach((model, index) => {
      const modelRef = variantRefs.current[index];
      if (!modelRef) return;

      const shouldBeVisible = index === currentIndex;
      modelRef.visible = shouldBeVisible;

      if (!shouldBeVisible) {
        setSceneOpacity(model.scene, 0);
      }
    });

    setSceneOpacity(currentModel.scene, 1);

    if (currentRef) {
      const currentScale = currentModel.fitScale * currentModel.item.scaleBoost;
      const scalePulse = 1 + Math.sin(now * 1.65) * 0.02;
      const targetScale = currentScale * (0.95 + easedMix * 0.05) * scalePulse;
      const targetEnterY = (1 - easedMix) * 0.22;
      const targetRotation = currentModel.item.rotation || [0, 0, 0];

      currentRef.position.y += (targetEnterY - currentRef.position.y) * 0.14;
      currentRef.scale.x += (targetScale - currentRef.scale.x) * 0.12;
      currentRef.scale.y += (targetScale - currentRef.scale.y) * 0.12;
      currentRef.scale.z += (targetScale - currentRef.scale.z) * 0.12;
      currentRef.rotation.x += (targetRotation[0] - currentRef.rotation.x) * 0.14;
      currentRef.rotation.y += (targetRotation[1] - currentRef.rotation.y) * 0.14;
      currentRef.rotation.z += (targetRotation[2] - currentRef.rotation.z) * 0.14;
    }

  });

  return (
    <group ref={rootRef} {...props}>
      {preparedModels.map((model, index) => {
        return (
          <group
            key={model.item.path}
            ref={(node) => {
              variantRefs.current[index] = node;
            }}
            scale={model.fitScale * model.item.scaleBoost}
            visible
          >
            <primitive
              object={model.scene}
              position={[-model.center.x, -model.center.y, -model.center.z]}
            />
          </group>
        );
      })}
    </group>
  );
}

FOOD_SHOWCASE_ITEMS.forEach((item) => {
  useLoader.preload(GLTFLoader, item.path);
});
