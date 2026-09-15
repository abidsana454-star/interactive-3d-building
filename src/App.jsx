import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BuildingModel from './components/BuildingModel.jsx';

const planData = {
  GROUND: {
    title: 'Ground Floor',
    subtitle: '3 Bed - 2 Bath, Main Living Area',
    image: '/plans/main-floor.jpg',
    area: '93.5',
    id: '101',
  },
  FIRST: {
    title: '1st Floor',
    subtitle: 'Alternate Layout - Den / Office',
    image: '/plans/den-office.jpg',
    area: '61.2',
    id: '102',
  },
  SECOND: {
    title: '2nd Floor',
    subtitle: 'Primary Bathroom - Garden Tub',
    image: '/plans/primary-bath.jpg',
    area: '18.4',
    id: '103',
  },
  RIGHT: {
    title: 'Right Side',
    subtitle: 'Kitchen Pantry Layout',
    image: '/plans/pantry.jpg',
    area: '14.8',
    id: '104',
  },
};

export default function App() {
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoverZone, setHoverZone] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [selectedZone, setSelectedZone] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const controlsRef = useRef();

  const handleHover = (zone, clientX, clientY) => {
    setHoverZone(zone);
    if (clientX != null && clientY != null) {
      setHoverPos({ x: clientX, y: clientY });
    }
  };

  const handleSectionClick = (zone) => {
    setSelectedZone(zone);
    setActivePlan(planData[zone]);
  };

  const handleCardClick = (zoneKey) => {
    setSelectedZone(zoneKey);
    setActivePlan(planData[zoneKey]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, display: 'flex', fontFamily: 'sans-serif', background: '#fff' }}>
      {/* LEFT: Sidebar with plan cards */}
      <div
        style={{
          width: '380px',
          minWidth: '380px',
          height: '100%',
          overflowY: 'auto',
          background: '#ffffff',
          borderRight: '1px solid #e5e5e5',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: 4, color: '#1a1a1a' }}>
          Floor Plans
        </div>
        <div style={{ fontSize: '13px', color: '#888', marginBottom: 20 }}>
          Hover the building or select a card
        </div>

        {Object.entries(planData).map(([key, plan]) => {
          const isActive = selectedZone === key || hoverZone === key;
          return (
            <div
              key={key}
              onClick={() => handleCardClick(key)}
              onMouseEnter={() => setHoverZone(key)}
              onMouseLeave={() => setHoverZone(null)}
              style={{
                border: isActive ? '2px solid #4da3ff' : '1px solid #e5e5e5',
                borderRadius: '12px',
                marginBottom: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
                background: '#fafafa',
              }}
            >
              <img
                src={plan.image}
                alt={plan.title}
                style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block', background: '#eee' }}
              />
              <div style={{ padding: '14px 16px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    background: '#3fae6a',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    marginBottom: 10,
                  }}
                >
                  Available
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>
                  {plan.title}
                </div>
                <div style={{ fontSize: '12px', color: '#777', marginBottom: 10 }}>
                  {plan.subtitle}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#555' }}>
                  <span>📐 {plan.area} sq.m</span>
                  <span># {plan.id}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT: 3D building viewer */}
      <div style={{ flex: 1, position: 'relative', background: '#f4f4f4' }}>
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            background: 'rgba(255,255,255,0.95)',
            padding: '10px 14px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: '#222',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          </button>
        </div>

        {hoverZone && (
          <div
            style={{
              position: 'fixed',
              left: Math.min(hoverPos.x + 24, window.innerWidth - 260),
              top: Math.min(hoverPos.y + 24, window.innerHeight - 220),
              zIndex: 50,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              width: '220px',
              pointerEvents: 'none',
            }}
          >
            <img
              src={planData[hoverZone]?.image}
              alt={planData[hoverZone]?.title}
              style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>
                {planData[hoverZone]?.title}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {planData[hoverZone]?.subtitle}
              </div>
            </div>
          </div>
        )}

        <Canvas>
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 10, 7.5]} intensity={1.2} />
          <directionalLight position={[-5, 5, -7.5]} intensity={0.4} />
          <BuildingModel
            autoRotate={autoRotate}
            hoverZone={hoverZone}
            onHover={handleHover}
            onSectionClick={handleSectionClick}
          />
          <OrbitControls ref={controlsRef} makeDefault enablePan={true} />
        </Canvas>
      </div>

      {/* Full detail modal on click */}
      {activePlan && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setActivePlan(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              overflow: 'hidden',
              maxWidth: '520px',
              width: '90%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePlan.image}
              alt={activePlan.title}
              style={{ width: '100%', display: 'block', background: '#f4f4f4' }}
            />
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: 4 }}>
                {activePlan.title}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: 16 }}>
                {activePlan.subtitle}
              </div>
              <button
                onClick={() => setActivePlan(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#222',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
