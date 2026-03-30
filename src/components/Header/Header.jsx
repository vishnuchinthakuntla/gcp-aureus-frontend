import React from 'react'
import useAgentStore from '../../stores/useAgentStore'
import Covalense_Global_logo from '../../assets/Covalense_Global_logo.svg'
import './Header.css'

/* ── Header ── */

// const Header = ({ onMenuToggle }) => {
//   const info = useAgentStore(s => s.header.info)
//   const wsConnected = useAgentStore(s => s.wsConnected)

//   return (
//     <header>
//       {/* top nav bar */}
//       <div className="header">
//         {/* Brand */}
//         <div className="header__brand">
//           <button className="header__hamburger" onClick={onMenuToggle} aria-label="Toggle menu">
//             ☰
//           </button>
//           <div className="header__logo">
//             <div className="header__logo-inner">
//               <span className="header__logo-globe">🌐</span>
//               <div>
//                 <div className="header__logo-name">Covalense</div>
//                 <div className="header__logo-badge">Global</div>
//               </div>
//             </div>
//             <span className="header__logo-tagline">Collaborate. Innovate. Accelerate</span>
//           </div>
//         </div>

//         {/* Title */}
//         <div className="header__title-area">
//           <div className="header__title">{info.title || 'AUREUS UNITY COMMAND CENTRE'}</div>
//           <div className="header__subtitle">
//             {info.subtitle || 'Real-time intelligence'}
//             <span>·</span>
//             {info.agent_count || 7} agents
//             <span>·</span>
//             Last refresh: {info.last_refresh || '—'}
//           </div>
//         </div>

//         {/* Meta */}
//         <div className="header__meta">
//           <span className="header__welcome">Welcome, {info.user_name || 'Jayadev Thimmaraju'}</span>
//           <span className="header__agent-badge">{info.agent_count || 7} AGENTS</span>
//           <span className="header__live-badge">
//             {wsConnected && <span className="header__live-dot" />}
//             {wsConnected ? 'LIVE' : 'OFFLINE'}
//           </span>
//         </div>
//       </div>
//     </header>
//   )
// }

export default function TopNav({ open, onMenuToggle }) {

  const info = useAgentStore(s => s.header.info)
  const wsConnected = useAgentStore(s => s.wsConnected)

  return (
    <nav className="topnav">
      <div className={`hamburger${open ? ' active' : ''}`} onClick={onMenuToggle}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      <div style={{ padding: '2px 4px 0 0', display: 'flex', alignItems: 'center' }}>
        <img
          height="40"
          src={Covalense_Global_logo}
          style={{ filter: 'brightness(0) invert(1)', opacity: 0.92, width: "115px" }}
          alt="Logo"
        />
      </div>
      <div className="page-title-main">
        <div className="page-title">AUREUS UNITY COMMAND CENTRE</div>
        <div className="page-subtitle">
          Real-time intelligence · {info.agent_count || '7'} agents · Last refresh: <span>{info.last_refresh || '—'}</span>
        </div>
      </div>
      <div className="nav-pill">
        <span style={{ color: '#ffffff' }}>
          Welcome, <span style={{ color: '#ffffff' }}>{info.user_name || 'Jayadev Thimmaraju'}</span>
        </span>
        <div className="page-header-meta">
          <span className="meta-chip meta-chip-blue">{info.agent_count || '7'} AGENTS</span>
          <span className="meta-chip meta-chip-green"> {wsConnected && <span className="header__live-dot" />}{wsConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>
    </nav>
  );
}