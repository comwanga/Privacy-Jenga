import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Block, SimplifiedJengaTowerProps } from '../../types';
import { useResponsiveDesign } from '../../hooks/useResponsiveDesign';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import soundManager from '../../services/soundManager';
import { detectDeviceCapabilities, getOptimalRenderSettings } from '../../utils/deviceDetection';

const SimplifiedJengaTower: React.FC<SimplifiedJengaTowerProps> = ({
  blocks,
  onBlockClick,
  gameState,
  selectedBlockId,
  onGameRestart
}) => {
  const [showGameInfo, setShowGameInfo] = useState(true);
  const { isMobile, isSmallMobile } = useResponsiveDesign();
  const [showStabilityWarning, setShowStabilityWarning] = useState(false);
  const [lastStabilityLevel, setLastStabilityLevel] = useState<'stable' | 'unstable' | 'critical'>('stable');
  const [warningTimer, setWarningTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Detect device capabilities and get optimal settings
  const [deviceCapabilities] = useState(() => detectDeviceCapabilities());
  const [renderSettings] = useState(() => getOptimalRenderSettings(deviceCapabilities));

  // Setup touch gestures for mobile
  useTouchGestures({
    onTap: (gesture) => {
      console.log('👆 Tap detected:', gesture);
      // Touch tap can trigger block selection if within canvas bounds
    },
    onSwipe: (gesture) => {
      console.log('👉 Swipe detected:', gesture);
      // Swipe can rotate camera if needed
    },
    onPinch: (gesture) => {
      console.log('🤏 Pinch detected, scale:', gesture.scale);
      // Pinch to zoom handled by OrbitControls
    },
    swipeThreshold: 30,
    longPressDelay: 400,
  });

  // Log device capabilities for debugging
  useEffect(() => {
    console.log('📱 Device Capabilities:', deviceCapabilities);
    console.log('⚙️ Render Settings:', renderSettings);
  }, [deviceCapabilities, renderSettings]);

  // Filter visible blocks
  const visibleBlocks = useMemo(() => {
    return blocks.filter(block => !block.isRemoved);
  }, [blocks]);

  // Handle block click
  const handleBlockClick = useCallback((block: Block) => {
    if (!block.isRemoved) {
      onBlockClick(block);
    }
  }, [onBlockClick]);

  // Manage stability warning display
  React.useEffect(() => {
    let currentStabilityLevel: 'stable' | 'unstable' | 'critical' = 'stable';
    
    if (gameState.towerStability <= 25 && gameState.towerStability > 0) {
      currentStabilityLevel = 'critical';
    } else if (gameState.towerStability <= 50 && gameState.towerStability > 0) {
      currentStabilityLevel = 'unstable';
    }

    // Show warning if stability level changed
    if (currentStabilityLevel !== lastStabilityLevel && currentStabilityLevel !== 'stable') {
      console.log(`🚨 Stability warning triggered: ${lastStabilityLevel} → ${currentStabilityLevel}`);
      
      // Play stability warning sound
      soundManager.playStabilityWarning();
      
      // Clear any existing timer
      if (warningTimer) {
        clearTimeout(warningTimer);
      }
      
      setShowStabilityWarning(true);
      setLastStabilityLevel(currentStabilityLevel);
      
      // Hide warning after 3 seconds
      const timer = setTimeout(() => {
        console.log('⏰ Hiding stability warning after 3 seconds');
        setShowStabilityWarning(false);
      }, 3000);
      
      setWarningTimer(timer);
    }
    
    // Cleanup function
    return () => {
      if (warningTimer) {
        clearTimeout(warningTimer);
      }
    };
  }, [gameState.towerStability, lastStabilityLevel, warningTimer]);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (warningTimer) {
        clearTimeout(warningTimer);
      }
    };
  }, [warningTimer]);

  // Get block color based on layer and difficulty
  const getBlockColor = (block: Block) => {
    // Color by layer (as shown in the image)
    if (block.layer <= 6) {
      // Bottom 6 layers - Red (Hard difficulty)
      return block.difficulty === 'hard' ? 0xdc2626 : 0xef4444;
    } else if (block.layer <= 12) {
      // Middle 6 layers - Orange (Medium difficulty)
      return block.difficulty === 'medium' ? 0xd97706 : 0xf59e0b;
    } else {
      // Top 6 layers - Green (Easy difficulty)
      return block.difficulty === 'easy' ? 0x059669 : 0x10b981;
    }
  };

  // Get block glow effect for selected blocks
  const getBlockGlow = (block: Block) => {
    if (selectedBlockId === block.id) {
      return 0x3b82f6; // Blue glow for selected block
    }
    return null;
  };

  // Get block type indicator (unused but kept for future use)
  // const getBlockTypeIndicator = (block: Block) => {
  //   if (block.type === 'QUESTION') {
  //     return '❓'; // Question mark for quiz blocks
  //   }
  //   return '💡'; // Lightbulb for tip blocks
  // };

  return (
    <div className="jenga-tower-container relative w-full h-full flex flex-col">
             {/* Enhanced Game Info Panel */}
       <div className={`absolute z-20 ${
         isSmallMobile ? 'top-2 right-2' : 
         isMobile ? 'top-3 right-3' : 
         'top-4 right-4'
       }`}>
         <div className="bg-black/90 backdrop-blur-sm rounded-lg border border-gray-600/50 overflow-hidden">
           <button
             onClick={() => setShowGameInfo(!showGameInfo)}
             className={`w-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors flex items-center justify-between text-white font-semibold ${
               isSmallMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'
             }`}
           >
             <div className="flex items-center gap-2">
               <span className="text-blue-400">🎯</span>
               {!isSmallMobile && "Game Status"}
             </div>
             <span className="text-gray-400">{showGameInfo ? '▼' : '▶'}</span>
           </button>
          
                     {showGameInfo && (
             <div className={`space-y-4 ${
               isSmallMobile ? 'p-2 space-y-2 max-w-xs' : 
               isMobile ? 'p-3 space-y-3 max-w-sm' : 
               'p-4 space-y-4 max-w-sm'
             }`}>
               {/* Score */}
               <div className={`text-center bg-blue-500/10 border border-blue-400/30 rounded-lg ${
                 isSmallMobile ? 'p-2' : 'p-3'
               }`}>
                 <div className={`text-blue-300 font-semibold mb-1 ${
                   isSmallMobile ? 'text-xs' : 'text-sm'
                 }`}>Score</div>
                 <div className={`text-white font-bold ${
                   isSmallMobile ? 'text-lg' : 'text-2xl'
                 }`}>{gameState.currentScore}</div>
               </div>

              {/* Tower Stability */}
              <div className="text-center p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
                <div className="text-green-300 text-sm font-semibold mb-1">Tower Stability</div>
                <div className="text-2xl font-bold text-green-400">
                  {gameState.towerStability >= 80 ? '🟢' : gameState.towerStability >= 50 ? '🟡' : '🔴'} {gameState.towerStability}%
                </div>
              </div>

              {/* Learning Progress */}
              <div className="text-center p-3 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                <div className="text-purple-300 text-sm font-semibold mb-1">Learning Progress</div>
                <div className="text-white text-lg font-bold">
                  {gameState.totalContentShown}/{gameState.totalContentAvailable}
                </div>
                <div className="text-purple-200 text-xs">concepts learned</div>
              </div>

              {/* Difficulty Level */}
              <div className="text-center p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                <div className="text-yellow-300 text-sm font-semibold mb-1">Difficulty</div>
                <div className="text-white text-lg font-bold capitalize">
                  {gameState.currentDifficulty}
                </div>
              </div>

              {/* Block Type Legend */}
              <div className="p-3 bg-gray-700/50 border border-gray-600/30 rounded-lg">
                <div className="text-gray-300 text-sm font-semibold mb-2">Block Types:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-green-300">Green = Safe blocks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-orange-300">Orange = Medium difficulty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-red-300">Red = Risky blocks</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

             {/* 3D Canvas */}
       <Canvas
         camera={{ 
           position: isSmallMobile ? [8, 8, 8] : isMobile ? [7, 7, 7] : [6, 6, 6], 
           fov: isSmallMobile ? 50 : 45 
         }}
         className="w-full flex-1"
         style={{ 
           minHeight: isSmallMobile ? '400px' : isMobile ? '500px' : '600px',
           aspectRatio: isSmallMobile ? '4/3' : '16/9',
           maxHeight: isSmallMobile ? '70vh' : '80vh',
           touchAction: 'none', // Improve touch responsiveness
         }}
         gl={{ 
           antialias: renderSettings.antialias,
           alpha: false,
           powerPreference: 'high-performance',
           stencil: false,
           depth: true,
         }}
         dpr={renderSettings.pixelRatio}
       >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />
        
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#1f2937" transparent opacity={0.3} />
        </mesh>
        
        {/* Grid helper for better spatial reference */}
        <gridHelper args={[8, 8, 0x374151, 0x1f2937]} position={[0, -0.04, 0]} />
        
        {/* Render blocks with enhanced design */}
        {visibleBlocks.map((block) => {
          const blockColor = getBlockColor(block);
          const glowColor = getBlockGlow(block);
          const isSelected = selectedBlockId === block.id;
          
          // Add instability effects based on tower stability
          const isUnstable = gameState.towerStability <= 50;
          const isCritical = gameState.towerStability <= 25;
          
          // Calculate instability offset for shake effect
          const instabilityOffset = isUnstable ? 
            (isCritical ? 0.05 : 0.02) * Math.sin(Date.now() * 0.01 + block.id.charCodeAt(0)) : 0;
          
          // Adjust block position for shake effect
          const shakePosition: [number, number, number] = [
            block.worldPosition[0] + instabilityOffset,
            block.worldPosition[1],
            block.worldPosition[2] + instabilityOffset
          ];
          
          return (
            <group key={block.id}>
                             {/* Main block */}
               <mesh
                 position={shakePosition}
                 onClick={() => handleBlockClick(block)}
                 castShadow
                 receiveShadow
               >
                 <boxGeometry args={[1, 0.3, 1]} />
                                   <meshStandardMaterial
                    color={isCritical ? 0xff4444 : blockColor}
                    metalness={0.2}
                    roughness={0.6}
                    // eslint-disable-next-line react/no-unknown-property
                    emissive={isCritical ? 0xff0000 : (glowColor || 0x000000)}
                    // eslint-disable-next-line react/no-unknown-property
                    emissiveIntensity={isSelected ? 0.4 : (isCritical ? 0.3 : 0)}
                  />
               </mesh>
               
               {/* Block edge highlights for better definition */}
               <mesh position={shakePosition}>
                 <boxGeometry args={[1.02, 0.32, 1.02]} />
                 <meshStandardMaterial
                   color={0xffffff}
                   transparent
                   opacity={0.1}
                   wireframe={true}
                 />
               </mesh>
              
              {/* Block type indicator */}
              <mesh position={[block.worldPosition[0], block.worldPosition[1] + 0.2, block.worldPosition[2]]}>
                <boxGeometry args={[0.8, 0.05, 0.8]} />
                                 <meshStandardMaterial 
                   color="#ffffff" 
                   transparent 
                   opacity={0.2}
                   // eslint-disable-next-line react/no-unknown-property
                   emissive={0xffffff}
                   // eslint-disable-next-line react/no-unknown-property
                   emissiveIntensity={0.1}
                 />
              </mesh>
              
              {/* Selection highlight */}
              {isSelected && (
                <mesh position={block.worldPosition}>
                  <boxGeometry args={[1.1, 0.35, 1.1]} />
                  <meshStandardMaterial
                    color={0x3b82f6}
                    transparent
                    opacity={0.3}
                    wireframe={true}
                  />
                </mesh>
              )}
            </group>
          );
        })}

                 {/* Improved camera controls */}
         <OrbitControls 
           enablePan={!isSmallMobile}
           enableZoom={true}
           enableRotate={true}
           minDistance={isSmallMobile ? 6 : 4}
           maxDistance={isSmallMobile ? 20 : 15}
           maxPolarAngle={Math.PI * 0.8}
           target={[0, 3, 0.375]}
           dampingFactor={0.05}
           enableDamping={true}
         />
      </Canvas>

      {/* Enhanced Game Phase Indicators */}
      
             {/* Stability Warning - Brief Pop-up */}
       {showStabilityWarning && (
         <div className={`absolute inset-0 backdrop-blur-sm z-20 flex items-center justify-center transition-all duration-500 animate-in fade-in ${
           lastStabilityLevel === 'critical' ? 'bg-black/60' : 'bg-black/40'
         }`}>
           <div className={`rounded-2xl p-6 max-w-md text-center animate-bounce transition-all duration-300 animate-in zoom-in relative ${
             lastStabilityLevel === 'critical' 
               ? 'bg-red-900/90 border border-red-600' 
               : 'bg-orange-900/80 border border-orange-600'
           }`}>
             {/* Close button */}
             <button
               onClick={() => {
                 console.log('🔴 Manual close of stability warning');
                 setShowStabilityWarning(false);
                 if (warningTimer) {
                   clearTimeout(warningTimer);
                 }
               }}
               className="absolute top-2 right-2 text-white hover:text-gray-300 text-xl font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/20 transition-colors"
             >
               ×
             </button>
             
             <div className="text-4xl mb-3">
               {lastStabilityLevel === 'critical' ? '🚨' : '⚠️'}
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">
               {lastStabilityLevel === 'critical' ? 'Critical Stability!' : 'Tower Unstable!'}
             </h2>
             <p className={`mb-3 ${
               lastStabilityLevel === 'critical' ? 'text-red-200' : 'text-orange-200'
             }`}>
               Stability: {gameState.towerStability}% - {lastStabilityLevel === 'critical' ? 'One wrong answer could collapse the tower!' : 'Be careful!'}
             </p>
             <p className="text-gray-300 text-sm">
               {lastStabilityLevel === 'critical' ? 'Answer carefully or the tower will fall!' : 'Wrong answers will collapse the tower!'}
             </p>
             <p className="text-gray-400 text-xs mt-2">
               (Auto-hides in 3 seconds or click × to close)
             </p>
           </div>
         </div>
       )}

             {/* Tower Collapsed */}
       {gameState.gamePhase === 'collapsed' && (
         <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center">
           <div className="bg-red-900/90 border border-red-600 rounded-2xl p-8 max-w-md text-center">
             <div className="text-6xl mb-4">💥</div>
             <h2 className="text-3xl font-bold text-white mb-4">Game Ended!</h2>
             <p className="text-red-200 mb-4">
               The tower has fallen! Your final score: <span className="text-2xl font-bold text-yellow-400">{gameState.currentScore}</span>
             </p>
             <p className="text-gray-300 mb-6">
               Concepts learned: {gameState.totalContentShown}/54
             </p>
                           <p className="text-orange-200 mb-6 italic">
                &quot;Oops! The tower got a bit too wobbly! 🎲 Better luck next time, privacy warrior!&quot;
              </p>
             <div className="space-y-3">
                               <button
                  onClick={onGameRestart || (() => window.location.reload())}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full"
                >
                  🏗️ Rebuild & Play Again
                </button>
               <button
                 onClick={() => window.location.href = '/'}
                 className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full"
               >
                 🏠 Back to Menu
               </button>
             </div>
           </div>
         </div>
       )}

      {gameState.gamePhase === 'completed' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center">
          <div className="bg-green-900/90 border border-green-600 rounded-2xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-4">Privacy Master!</h2>
                         <p className="text-green-200 mb-6">
               Congratulations! You&apos;ve learned all 54 Bitcoin privacy concepts!
             </p>
            <p className="text-gray-300 mb-6">
              Your final score: {gameState.currentScore} points
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

             {/* Instructions Overlay */}
       <div className={`absolute z-20 ${
         isSmallMobile ? 'bottom-2 left-2' : 
         isMobile ? 'bottom-3 left-3' : 
         'bottom-4 left-4'
       }`}>
         <div className={`bg-black/80 backdrop-blur-sm rounded-lg border border-gray-600/50 ${
           isSmallMobile ? 'p-2' : 'p-3'
         }`}>
           <div className={`text-gray-300 space-y-1 ${
             isSmallMobile ? 'text-xs' : 'text-xs'
           }`}>
             <div className={`font-semibold text-white mb-2 ${
               isSmallMobile ? 'text-xs' : 'text-xs'
             }`}>How to Play:</div>
             <div>• Click on any block to reveal content</div>
             <div>• Answer questions correctly to maintain stability</div>
             {!isSmallMobile && (
               <>
                 <div>• Learn all 54 privacy concepts!</div>
                 <div>• Difficulty adapts to your performance</div>
               </>
             )}
           </div>
         </div>
       </div>

             {/* Stability Warning Indicator */}
       {gameState.towerStability <= 50 && (
         <div className={`absolute z-20 ${
           isSmallMobile ? 'top-2 left-2' : 
           isMobile ? 'top-3 left-3' : 
           'top-4 left-4'
         }`}>
           <div className={`bg-black/80 backdrop-blur-sm rounded-lg border ${
             gameState.towerStability <= 25 ? 'border-red-500' : 'border-orange-500'
           } ${isSmallMobile ? 'p-2' : 'p-3'}`}>
             <div className="text-center">
               <div className={`font-bold ${
                 gameState.towerStability <= 25 ? 'text-red-400' : 'text-orange-400'
               } ${isSmallMobile ? 'text-base' : 'text-lg'}`}>
                 {gameState.towerStability <= 25 ? '🚨' : '⚠️'} {gameState.towerStability}%
               </div>
               <div className={`text-gray-300 mt-1 ${
                 isSmallMobile ? 'text-xs' : 'text-xs'
               }`}>
                 {gameState.towerStability <= 25 ? 'Critical!' : 'Unstable!'}
               </div>
               <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                 <div 
                   className={`h-1 rounded-full transition-all duration-300 ${
                     gameState.towerStability <= 25 ? 'bg-red-500' : 'bg-orange-500'
                   }`}
                   style={{ width: `${gameState.towerStability}%` }}
                 />
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default SimplifiedJengaTower;
