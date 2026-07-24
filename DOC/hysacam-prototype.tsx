import React, { useState } from "react";
import {
  Camera, MapPin, Star, Bell, User, Clock, Check, X, ChevronLeft,
  Navigation, Filter, Plus, AlertTriangle, CheckCircle2, Circle,
  Home as HomeIcon, List, Phone, Trash2, Package, PackageOpen, Boxes,
  MoreHorizontal, Printer, Search, ShieldAlert, ShieldCheck, ShieldX, ChevronRight, Users, Crosshair, Edit3
} from "lucide-react";

const RED = "#C1272D";
const RED_DARK = "#8F1B20";
const GREEN = "#1E7B34";
const GREEN_LIGHT = "#E3F3E6";
const INK = "#1C1C1C";
const PAPER = "#FAFAF9";
const LINE = "#E4E1DC";
const AMBER = "#B8791A";
const AMBER_LIGHT = "#FBF0DF";

const mono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };
const display = { fontFamily: "'Manrope', system-ui, sans-serif" };

const CITIZEN_SCREENS = [
  { id: "login", label: "1 · Connexion" },
  { id: "home", label: "2 · Accueil" },
  { id: "notifications", label: "3 · Notifications" },
  { id: "capture", label: "4 · Capture" },
  { id: "confirm", label: "5 · Confirmation" },
  { id: "success", label: "6 · Envoyé" },
  { id: "map", label: "7 · Carte" },
  { id: "history", label: "8 · Historique" },
  { id: "profile", label: "9 · Profil" },
];

const AGENT_SCREENS = [
  { id: "dashboard", label: "10 · Tableau de bord" },
  { id: "treatment", label: "11 · Traitement" },
  { id: "points", label: "12 · Points de collecte" },
  { id: "citizens", label: "13 · Gestion citoyens" },
  { id: "citizenDetail", label: "14 · Fiche citoyen" },
];

const notifications = [
  { id: 1, type: "validation", text: "Votre signalement (Rue 12, Bonapriso) a été validé — +10 points", time: "il y a 2 h", read: false },
  { id: 2, type: "collecte", text: "Le dépôt du Marché Mokolo que vous avez signalé a été collecté", time: "hier, 16:40", read: false },
  { id: 3, type: "point", text: "Un nouveau point de collecte a été ajouté près de chez vous", time: "hier, 09:15", read: true },
  { id: 4, type: "rejet", text: "Signalement rejeté : photo non conforme", time: "12 juil.", read: true },
  { id: 5, type: "avertissement", text: "Avertissement HYSACAM : merci de vérifier vos signalements avant l'envoi", time: "10 juil.", read: true },
];

const citizens = [
  { id: 1, name: "Amina Mbarga", city: "Douala", points: 240, reports: 18, reliability: 89, status: "fiable" },
  { id: 2, name: "Paul Ateba", city: "Yaoundé", points: 65, reports: 22, reliability: 41, status: "surveiller" },
  { id: 3, name: "Chantal Ngo", city: "Douala", points: 410, reports: 34, reliability: 94, status: "fiable" },
  { id: 4, name: "Ibrahim Sali", city: "Garoua", points: 10, reports: 9, reliability: 22, status: "suspendu" },
];

const reports = [
  { id: 1, zone: "Akwa, Douala", vol: "Tas important", age: "3 j", status: "attente" },
  { id: 2, zone: "Biyem-Assi, Yaoundé", vol: "Plusieurs sacs", age: "1 j", status: "attente" },
  { id: 3, zone: "Bonapriso, Douala", vol: "Petit sac", age: "5 h", status: "attente" },
];

const collectionPoints = [
  { name: "Point Marché Central", dist: "320 m", hours: "6h – 18h" },
  { name: "Point Carrefour Bonanjo", dist: "540 m", hours: "6h – 20h" },
  { name: "Point Rond-Point Deido", dist: "1.1 km", hours: "24h/24" },
];

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[11px]" style={{ ...mono, color: INK }}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span>●●●</span>
        <span>◐</span>
      </div>
    </div>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
      <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ visibility: onBack ? "visible" : "hidden" }}>
        <ChevronLeft size={20} color={INK} />
      </button>
      <span className="text-[15px] font-bold" style={{ ...display, color: INK }}>{title}</span>
      <div className="w-8 h-8 flex items-center justify-center">{right}</div>
    </div>
  );
}

function TabBar({ active, onNav }) {
  const tabs = [
    { id: "home", icon: HomeIcon, label: "Accueil" },
    { id: "map", icon: MapPin, label: "Carte" },
    { id: "history", icon: List, label: "Suivi" },
    { id: "profile", icon: User, label: "Profil" },
  ];
  return (
    <div className="flex items-stretch" style={{ borderTop: `1px solid ${LINE}`, background: "#fff" }}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onNav(t.id)} className="flex-1 flex flex-col items-center gap-1 py-2.5">
            <Icon size={19} color={isActive ? RED : "#B5B0A8"} strokeWidth={isActive ? 2.4 : 1.8} />
            <span className="text-[10px]" style={{ ...display, color: isActive ? RED : "#B5B0A8", fontWeight: isActive ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MiniMap({ height = "h-28", bg = "#F5EDE4", markers = [], line = null, distanceLabel = null, legend = null }) {
  return (
    <div className={`relative ${height} rounded-xl overflow-hidden`} style={{ background: bg }}>
      {line && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#9C968B" strokeWidth="0.8" strokeDasharray="2.5,2" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {markers.map((m, i) => (
        <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ top: m.top, left: m.left }}>
          <div className="rounded-full" style={{ width: m.size || 13, height: m.size || 13, background: m.color, boxShadow: "0 0 0 2px #fff, 0 1px 3px rgba(0,0,0,0.25)" }} />
        </div>
      ))}
      {distanceLabel && (
        <div className="absolute px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ ...mono, background: "#fff", color: INK, top: "50%", left: "50%", transform: "translate(-50%,-50%)", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
          {distanceLabel}
        </div>
      )}
      {legend && (
        <div className="absolute bottom-1.5 left-1.5 flex gap-1.5">
          {legend.map((l, i) => (
            <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.92)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[9px] font-bold" style={{ ...mono, color: INK }}>{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ children, color, bg }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ color, background: bg, ...mono }}>
      {children}
    </span>
  );
}

function BigButton({ color, icon: Icon, label, sub, onClick }) {
  return (
    <button onClick={onClick} className="flex-1 rounded-2xl flex flex-col items-center justify-center gap-2 py-6 active:scale-[0.98] transition-transform" style={{ background: color }}>
      <Icon size={26} color="#fff" strokeWidth={2.2} />
      <span className="text-[13px] font-bold text-white text-center leading-tight px-2" style={display}>{label}</span>
      {sub && <span className="text-[10px] text-white/80 text-center px-2" style={mono}>{sub}</span>}
    </button>
  );
}

// ---------- CITIZEN SCREENS ----------

function LoginScreen() {
  const [step, setStep] = useState(0);
  return (
    <div className="flex-1 flex flex-col px-6 pt-10">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: RED }}>
          <Trash2 size={26} color="#fff" />
        </div>
        <h1 className="text-[19px] font-extrabold text-center leading-tight" style={{ ...display, color: INK }}>
          Ensemble pour un<br />Cameroun propre
        </h1>
      </div>

      {step === 0 ? (
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold uppercase tracking-wide" style={{ ...mono, color: "#8A857C" }}>Numéro de téléphone</label>
          <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ border: `1.5px solid ${LINE}` }}>
            <Phone size={16} color="#8A857C" />
            <span className="text-[14px]" style={mono}>+237 6·· ·· ·· ··</span>
          </div>
          <button onClick={() => setStep(1)} className="mt-4 rounded-xl py-3.5 text-white text-[14px] font-bold" style={{ background: RED, ...display }}>
            Recevoir un code
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold uppercase tracking-wide" style={{ ...mono, color: "#8A857C" }}>Code reçu par SMS</label>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-12 h-12 rounded-xl flex items-center justify-center text-[16px] font-bold" style={{ border: `1.5px solid ${GREEN}`, ...mono, color: INK }}>
                {i < 2 ? "•" : ""}
              </div>
            ))}
          </div>
          <button className="mt-4 rounded-xl py-3.5 text-white text-[14px] font-bold" style={{ background: GREEN, ...display }}>
            Valider
          </button>
          <span className="text-[11px] text-center mt-1" style={{ ...mono, color: "#8A857C" }}>Renvoyer le code dans 00:47</span>
        </div>
      )}
    </div>
  );
}

function HomeScreen({ go }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div>
          <p className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>Bonjour,</p>
          <p className="text-[16px] font-extrabold" style={{ ...display, color: INK }}>Amina M.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full" style={{ background: AMBER_LIGHT }}>
            <Star size={13} color={AMBER} fill={AMBER} />
            <span className="text-[12px] font-bold" style={{ ...mono, color: AMBER }}>240</span>
          </div>
          <button onClick={() => go("notifications")} className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#F1EFEA" }}>
            <Bell size={16} color={INK} />
            <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: RED }} />
          </button>
        </div>
      </div>

      <div className="px-5 mt-3 flex gap-3">
        <BigButton color={RED} icon={Camera} label="Signaler un dépôt" sub="prendre une photo" onClick={() => go("capture")} />
        <BigButton color={GREEN} icon={MapPin} label="Trouver un point" sub="collecte officielle" onClick={() => go("map")} />
      </div>

      <div className="px-5 mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ ...mono, color: "#8A857C" }}>Vos derniers signalements</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-xl px-3.5 py-3" style={{ border: `1px solid ${LINE}` }}>
            <div>
              <p className="text-[13px] font-bold" style={{ ...display, color: INK }}>Rue 12, Bonapriso</p>
              <p className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>12 juil., 14:20</p>
            </div>
            <Badge color={AMBER} bg={AMBER_LIGHT}>En attente</Badge>
          </div>
          <div className="flex items-center justify-between rounded-xl px-3.5 py-3" style={{ border: `1px solid ${LINE}` }}>
            <div>
              <p className="text-[13px] font-bold" style={{ ...display, color: INK }}>Marché Mokolo</p>
              <p className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>08 juil., 09:05</p>
            </div>
            <Badge color={GREEN} bg={GREEN_LIGHT}>Collecté</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsScreen({ go }) {
  const cfg = {
    validation: { Icon: CheckCircle2, color: GREEN, bg: GREEN_LIGHT },
    collecte: { Icon: CheckCircle2, color: GREEN, bg: GREEN_LIGHT },
    point: { Icon: MapPin, color: "#2563A8", bg: "#E5EEF7" },
    rejet: { Icon: X, color: RED, bg: "#FBEBEC" },
    avertissement: { Icon: ShieldAlert, color: AMBER, bg: AMBER_LIGHT },
  };
  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Notifications" onBack={() => go("home")} />
      <div className="flex-1 px-4 py-3 flex flex-col gap-2 overflow-y-auto">
        {notifications.map((n) => {
          const c = cfg[n.type];
          const Icon = c.Icon;
          return (
            <div key={n.id} className="flex items-start gap-3 rounded-xl px-3.5 py-3" style={{ border: `1px solid ${LINE}`, background: n.read ? "#fff" : "#FBFAF7" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: c.bg }}>
                <Icon size={14} color={c.color} />
              </div>
              <div className="flex-1">
                <p className="text-[12.5px] leading-snug" style={{ ...display, color: INK, fontWeight: n.read ? 500 : 700 }}>{n.text}</p>
                <p className="text-[10px] mt-1" style={{ ...mono, color: "#8A857C" }}>{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: RED }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}


function CaptureScreen({ go }) {
  const [gps, setGps] = useState(true);
  return (
    <div className="flex-1 flex flex-col relative" style={{ background: "#14140F" }}>
      <div className="flex items-center justify-between px-4 pt-4">
        <button onClick={() => go("home")} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
          <X size={16} color="#fff" />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: gps ? "rgba(30,123,52,0.85)" : "rgba(184,121,26,0.85)" }}>
          {gps ? <CheckCircle2 size={13} color="#fff" /> : <Circle size={13} color="#fff" />}
          <span className="text-[11px] font-bold text-white" style={mono}>{gps ? "Position détectée" : "Recherche de position..."}</span>
        </div>
        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 opacity-40">
          <Camera size={40} color="#fff" strokeWidth={1.2} />
          <span className="text-[11px] text-white" style={mono}>aperçu caméra</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 pb-8">
        <span className="text-[11px] text-white/70" style={mono}>Cadrez le dépôt de déchets</span>
        <button onClick={() => go("confirm")} className="w-16 h-16 rounded-full flex items-center justify-center" style={{ border: "3px solid #fff" }}>
          <div className="w-12 h-12 rounded-full" style={{ background: RED }} />
        </button>
      </div>
    </div>
  );
}

function ConfirmScreen({ go }) {
  const [volume, setVolume] = useState(1);
  const vols = [
    { icon: Package, label: "Petit sac" },
    { icon: PackageOpen, label: "Plusieurs sacs" },
    { icon: Boxes, label: "Tas important" },
  ];
  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Confirmer le signalement" onBack={() => go("capture")} />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="h-36 flex items-center justify-center" style={{ background: "#EDEAE3" }}>
          <span className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>[ photo capturée ]</span>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4 flex-1">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ ...mono, color: "#8A857C" }}>Volume estimé</p>
            <div className="flex gap-2">
              {vols.map((v, i) => {
                const Icon = v.icon;
                const active = volume === i;
                return (
                  <button key={i} onClick={() => setVolume(i)} className="flex-1 rounded-xl flex flex-col items-center gap-1.5 py-3" style={{ border: `1.5px solid ${active ? RED : LINE}`, background: active ? "#FBEBEC" : "#fff" }}>
                    <Icon size={18} color={active ? RED : "#8A857C"} />
                    <span className="text-[10px] font-semibold text-center px-1" style={{ ...display, color: active ? RED : "#8A857C" }}>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl px-3.5 py-3" style={{ border: `1px solid ${LINE}` }}>
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ border: `1.5px solid ${GREEN}` }}>
              <Check size={12} color={GREEN} />
            </div>
            <span className="text-[12px]" style={{ ...display, color: INK }}>reCAPTCHA vérifié</span>
          </div>
        </div>
      </div>
      <div className="px-5 pb-6 pt-2" style={{ borderTop: `1px solid ${LINE}` }}>
        <button onClick={() => go("success")} className="w-full rounded-xl py-3.5 text-white text-[14px] font-bold" style={{ background: RED, ...display }}>
          Envoyer le signalement
        </button>
      </div>
    </div>
  );
}

function SuccessScreen({ go }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-3">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ background: GREEN_LIGHT }}>
        <Check size={30} color={GREEN} strokeWidth={3} />
      </div>
      <h2 className="text-[17px] font-extrabold" style={{ ...display, color: INK }}>Signalement envoyé, merci !</h2>
      <Badge color={AMBER} bg={AMBER_LIGHT}>En attente de validation</Badge>
      <p className="text-[12px] leading-relaxed mt-1" style={{ ...display, color: "#8A857C" }}>
        Vous recevrez une notification une fois le dépôt collecté.
      </p>
      <p className="text-[12px] font-bold mt-1" style={{ ...mono, color: GREEN }}>+5 points en attente</p>
      <button onClick={() => go("home")} className="mt-5 w-full rounded-xl py-3.5 text-white text-[14px] font-bold" style={{ background: INK, ...display }}>
        Retour à l'accueil
      </button>
    </div>
  );
}

const MAP_MARKERS = [
  { top: 34, left: 56 },
  { top: 58, left: 200 },
  { top: 118, left: 150 },
];
const USER_POS = { top: 100, left: 40 };

function MapScreen({ go }) {
  const [selected, setSelected] = useState(null);
  const selectedPoint = selected !== null ? collectionPoints[selected] : null;
  const selectedPos = selected !== null ? MAP_MARKERS[selected] : null;

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Points de collecte" onBack={() => go("home")} />
      <div className="h-44 relative overflow-hidden" style={{ background: "#EFEAE0" }}>
        <span className="absolute top-2 left-3 text-[9px] font-bold uppercase tracking-wide z-10" style={{ ...mono, color: "#8A857C" }}>
          Points de collecte officiels
        </span>

        {selectedPos && (
          <svg className="absolute inset-0 w-full h-full">
            <line
              x1={USER_POS.left + 8} y1={USER_POS.top + 8}
              x2={selectedPos.left + 8} y2={selectedPos.top + 8}
              stroke={RED} strokeWidth="1.5" strokeDasharray="4 3"
            />
          </svg>
        )}

        {/* user position — green */}
        <div className="absolute flex flex-col items-center" style={{ top: USER_POS.top, left: USER_POS.left }}>
          <div className="w-4 h-4 rounded-full border-2 border-white" style={{ background: GREEN }} />
          <span className="text-[8px] font-bold mt-0.5 px-1 rounded" style={{ ...mono, color: "#fff", background: GREEN }}>vous</span>
        </div>

        {/* official collection points — red */}
        {collectionPoints.map((p, i) => (
          <button
            key={i}
            onClick={() => setSelected(i === selected ? null : i)}
            className="absolute flex flex-col items-center"
            style={{ top: MAP_MARKERS[i].top - 8, left: MAP_MARKERS[i].left - 8 }}
          >
            <MapPin size={20} color={RED} fill={selected === i ? RED : "#fff"} strokeWidth={2} />
          </button>
        ))}

        {selectedPoint && (
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-full z-10" style={{ background: "#fff", border: `1px solid ${LINE}` }}>
            <span className="text-[10px] font-bold" style={{ ...display, color: INK }}>{selectedPoint.name}</span>
            <span className="text-[11px] font-bold" style={{ ...mono, color: RED }}>{selectedPoint.dist}</span>
          </div>
        )}
        {!selectedPoint && (
          <span className="absolute bottom-2 left-3 text-[10px]" style={{ ...mono, color: "#8A857C" }}>touchez un point rouge pour voir la distance</span>
        )}
      </div>
      <div className="flex-1 px-4 py-3 flex flex-col gap-2 overflow-hidden">
        {collectionPoints.map((p, i) => (
          <button
            key={i}
            onClick={() => setSelected(i === selected ? null : i)}
            className="flex items-center justify-between rounded-xl px-3.5 py-3 text-left"
            style={{ border: `1.5px solid ${selected === i ? RED : LINE}`, background: selected === i ? "#FBEBEC" : "#fff" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: RED, ...mono }}>{i + 1}</div>
              <div>
                <p className="text-[13px] font-bold" style={{ ...display, color: INK }}>{p.name}</p>
                <p className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>{p.hours}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] font-bold" style={{ ...mono, color: RED }}>{p.dist}</span>
              <Navigation size={13} color="#8A857C" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryScreen({ go }) {
  const items = [
    { name: "Rue 12, Bonapriso", date: "12 juil.", status: "attente" },
    { name: "Marché Mokolo", date: "08 juil.", status: "valide" },
    { name: "Avenue Kennedy", date: "02 juil.", status: "collecte" },
  ];
  const cfg = {
    attente: { label: "En attente", color: AMBER, bg: AMBER_LIGHT },
    valide: { label: "Validé", color: "#2563A8", bg: "#E5EEF7" },
    collecte: { label: "Collecté", color: GREEN, bg: GREEN_LIGHT },
  };
  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Mes signalements" onBack={() => go("home")} />
      <div className="flex-1 px-4 py-3 flex flex-col gap-2">
        {items.map((it, i) => {
          const c = cfg[it.status];
          return (
            <div key={i} className="flex items-center justify-between rounded-xl px-3.5 py-3" style={{ border: `1px solid ${LINE}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg" style={{ background: "#EDEAE3" }} />
                <div>
                  <p className="text-[13px] font-bold" style={{ ...display, color: INK }}>{it.name}</p>
                  <p className="text-[11px] flex items-center gap-1" style={{ ...mono, color: "#8A857C" }}><Clock size={10} /> {it.date}</p>
                </div>
              </div>
              <Badge color={c.color} bg={c.bg}>{c.label}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileScreen({ go }) {
  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Mon profil" onBack={() => go("home")} />
      <div className="flex flex-col items-center pt-6 pb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: RED }}>
          <span className="text-[20px] font-extrabold text-white" style={display}>AM</span>
        </div>
        <p className="text-[15px] font-extrabold" style={{ ...display, color: INK }}>Amina Mbarga</p>
        <p className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>+237 6·· ·· ·· ·· · Douala</p>
      </div>
      <div className="px-5 flex gap-2 mb-4">
        <div className="flex-1 rounded-xl py-3 text-center" style={{ background: AMBER_LIGHT }}>
          <p className="text-[17px] font-extrabold" style={{ ...mono, color: AMBER }}>240</p>
          <p className="text-[10px] font-semibold" style={{ ...display, color: "#8A857C" }}>points</p>
        </div>
        <div className="flex-1 rounded-xl py-3 text-center" style={{ background: GREEN_LIGHT }}>
          <p className="text-[17px] font-extrabold" style={{ ...mono, color: GREEN }}>14</p>
          <p className="text-[10px] font-semibold" style={{ ...display, color: "#8A857C" }}>validés</p>
        </div>
      </div>
      <div className="px-5">
        <Badge color={RED} bg="#FBEBEC">Éco-héros</Badge>
      </div>
    </div>
  );
}

// ---------- AGENT SCREENS ----------

function DashboardScreen({ goAgent }) {
  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Signalements"
        right={
          <div className="flex items-center gap-2">
            <button title="Exporter / imprimer le rapport">
              <Printer size={16} color={INK} />
            </button>
          </div>
        }
      />
      <button onClick={() => goAgent("citizens")} className="mx-5 mt-3 flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ border: `1px solid ${LINE}`, background: "#fff" }}>
        <div className="flex items-center gap-2">
          <Users size={15} color={GREEN} />
          <span className="text-[12px] font-bold" style={{ ...display, color: INK }}>Gérer les citoyens</span>
        </div>
        <ChevronRight size={15} color="#8A857C" />
      </button>
      <div className="px-5 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[12px] font-bold" style={{ ...mono, color: RED }}>{reports.length} en attente</span>
        <span className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>trié par priorité</span>
      </div>
      <div className="mx-5 my-2 rounded-xl relative overflow-hidden" style={{ height: 128, background: "#EFEAE0" }}>
        <span className="absolute top-2 left-2.5 text-[9px] font-bold uppercase tracking-wide" style={{ ...mono, color: "#8A857C" }}>Carte des signalements</span>
        {/* new (unresolved) reports — green */}
        <div className="absolute" style={{ top: 46, left: 40 }}><MapPin size={16} color={GREEN} fill={GREEN} /></div>
        <div className="absolute" style={{ top: 70, left: 100 }}><MapPin size={16} color={GREEN} fill={GREEN} /></div>
        <div className="absolute" style={{ top: 34, left: 165 }}><MapPin size={16} color={GREEN} fill={GREEN} /></div>
        {/* already collected reports — red */}
        <div className="absolute" style={{ top: 88, left: 60 }}><MapPin size={14} color={RED} fill={RED} /></div>
        <div className="absolute" style={{ top: 52, left: 230 }}><MapPin size={14} color={RED} fill={RED} /></div>
        <div className="absolute" style={{ top: 96, left: 200 }}><MapPin size={14} color={RED} fill={RED} /></div>
        <div className="absolute bottom-2 left-2.5 flex items-center gap-3">
          <span className="flex items-center gap-1 text-[9px] font-bold" style={{ ...mono, color: GREEN }}><span className="w-2 h-2 rounded-full inline-block" style={{ background: GREEN }} /> Nouveaux</span>
          <span className="flex items-center gap-1 text-[9px] font-bold" style={{ ...mono, color: RED }}><span className="w-2 h-2 rounded-full inline-block" style={{ background: RED }} /> Déjà collectés</span>
        </div>
      </div>
      <div className="flex-1 px-4 flex flex-col gap-2 overflow-hidden">
        {reports.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-xl px-3.5 py-3" style={{ border: `1px solid ${LINE}` }}>
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} color={AMBER} />
              <div>
                <p className="text-[13px] font-bold" style={{ ...display, color: INK }}>{r.zone}</p>
                <p className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>{r.vol} · il y a {r.age}</p>
              </div>
            </div>
            <ChevronLeft size={16} color="#B5B0A8" style={{ transform: "rotate(180deg)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TreatmentScreen() {
  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Traiter le signalement" right={<MoreHorizontal size={16} color={INK} />} />
      <div className="h-36 flex items-center justify-center" style={{ background: "#EDEAE3" }}>
        <span className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>[ photo du signalement ]</span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ ...mono, color: "#8A857C" }}>Zone</span>
          <span className="text-[12px] font-bold" style={{ ...display, color: INK }}>Akwa, Douala</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ ...mono, color: "#8A857C" }}>Signalé le</span>
          <span className="text-[12px]" style={{ ...mono, color: INK }}>11 juil., 08:14</span>
        </div>
        <div className="rounded-xl relative overflow-hidden" style={{ height: 110, background: "#E9F2EA" }}>
          <span className="absolute top-2 left-2.5 text-[9px] font-bold uppercase tracking-wide" style={{ ...mono, color: "#5C8E68" }}>Distance jusqu'au signalement</span>
          <svg className="absolute inset-0 w-full h-full">
            <line x1="70" y1="75" x2="200" y2="35" stroke={GREEN} strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          <div className="absolute flex flex-col items-center" style={{ top: 55, left: 60 }}>
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: "#2563A8" }} />
            <span className="text-[8px] font-bold mt-0.5" style={{ ...mono, color: "#2563A8" }}>vous</span>
          </div>
          <div className="absolute" style={{ top: 20, left: 192 }}>
            <MapPin size={16} color={RED} fill={RED} />
          </div>
          <div className="absolute bottom-2 right-2.5 px-2 py-1 rounded-full" style={{ background: "#fff" }}>
            <span className="text-[10px] font-bold" style={{ ...mono, color: GREEN }}>≈ 1.4 km</span>
          </div>
        </div>
      </div>
      <div className="mt-auto px-5 pb-6 flex flex-col gap-2">
        <button className="w-full rounded-xl py-3 text-white text-[13px] font-bold" style={{ background: GREEN, ...display }}>Valider le signalement</button>
        <button className="w-full rounded-xl py-3 text-white text-[13px] font-bold" style={{ background: INK, ...display }}>Marquer comme collecté</button>
        <button className="w-full rounded-xl py-3 text-[13px] font-bold" style={{ border: `1.5px solid ${RED}`, color: RED, ...display }}>Rejeter (motif requis)</button>
      </div>
    </div>
  );
}

function PointsScreen() {
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState("manual"); // "manual" | "gps"
  const [captured, setCaptured] = useState(false);

  if (showForm) {
    return (
      <div className="flex-1 flex flex-col">
        <TopBar title="Ajouter un point" onBack={() => setShowForm(false)} />
        <div className="flex-1 px-5 py-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide" style={{ ...mono, color: "#8A857C" }}>Nom du point</label>
            <div className="mt-1.5 rounded-xl px-3.5 py-2.5" style={{ border: `1.5px solid ${LINE}` }}>
              <span className="text-[13px]" style={{ ...display, color: "#B5B0A8" }}>ex. Point Marché Central</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide" style={{ ...mono, color: "#8A857C" }}>Horaires</label>
            <div className="mt-1.5 rounded-xl px-3.5 py-2.5" style={{ border: `1.5px solid ${LINE}` }}>
              <span className="text-[13px]" style={{ ...display, color: "#B5B0A8" }}>ex. 6h – 18h</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide" style={{ ...mono, color: "#8A857C" }}>Localisation</label>
            <div className="mt-1.5 flex rounded-xl p-1" style={{ background: "#EFEAE0" }}>
              <button onClick={() => setMode("manual")} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2" style={{ background: mode === "manual" ? "#fff" : "transparent" }}>
                <Edit3 size={13} color={mode === "manual" ? RED : "#8A857C"} />
                <span className="text-[11px] font-bold" style={{ ...display, color: mode === "manual" ? RED : "#8A857C" }}>Manuelle</span>
              </button>
              <button onClick={() => setMode("gps")} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2" style={{ background: mode === "gps" ? "#fff" : "transparent" }}>
                <Crosshair size={13} color={mode === "gps" ? GREEN : "#8A857C"} />
                <span className="text-[11px] font-bold" style={{ ...display, color: mode === "gps" ? GREEN : "#8A857C" }}>Position GPS</span>
              </button>
            </div>

            {mode === "manual" ? (
              <div className="mt-3 flex flex-col gap-2.5">
                <div className="rounded-xl px-3.5 py-2.5" style={{ border: `1.5px solid ${LINE}` }}>
                  <span className="text-[13px]" style={{ ...display, color: "#B5B0A8" }}>Adresse (ex. Avenue de Gaulle, Douala)</span>
                </div>
                <div className="flex gap-2.5">
                  <div className="flex-1 rounded-xl px-3.5 py-2.5" style={{ border: `1.5px solid ${LINE}` }}>
                    <span className="text-[12px]" style={{ ...mono, color: "#B5B0A8" }}>Lat. 4.0511</span>
                  </div>
                  <div className="flex-1 rounded-xl px-3.5 py-2.5" style={{ border: `1.5px solid ${LINE}` }}>
                    <span className="text-[12px]" style={{ ...mono, color: "#B5B0A8" }}>Lon. 9.7679</span>
                  </div>
                </div>
                <div className="rounded-xl relative overflow-hidden" style={{ height: 90, background: "#EFEAE0" }}>
                  <span className="absolute top-2 left-2.5 text-[9px] font-bold uppercase tracking-wide" style={{ ...mono, color: "#8A857C" }}>Ajuster le repère sur la carte</span>
                  <MapPin size={20} color={RED} fill={RED} style={{ position: "absolute", top: 45, left: 130 }} />
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-col items-center gap-3 rounded-xl px-4 py-5" style={{ border: `1.5px dashed ${GREEN}`, background: GREEN_LIGHT }}>
                {!captured ? (
                  <>
                    <Crosshair size={22} color={GREEN} />
                    <p className="text-[11px] text-center" style={{ ...display, color: "#3C6B47" }}>Capturez automatiquement la position actuelle de l'agent sur le terrain</p>
                    <button onClick={() => setCaptured(true)} className="rounded-full px-4 py-2 text-white text-[12px] font-bold" style={{ background: GREEN, ...display }}>
                      Utiliser ma position actuelle
                    </button>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={22} color={GREEN} />
                    <p className="text-[12px] font-bold" style={{ ...mono, color: GREEN }}>Position capturée : 4.0511, 9.7679</p>
                    <span className="text-[10px]" style={{ ...display, color: "#3C6B47" }}>précision ± 6 m</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="px-5 pb-6 pt-2" style={{ borderTop: `1px solid ${LINE}` }}>
          <button onClick={() => setShowForm(false)} className="w-full rounded-xl py-3.5 text-white text-[14px] font-bold" style={{ background: GREEN, ...display }}>
            Enregistrer le point de collecte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Points de collecte" right={<button onClick={() => setShowForm(true)}><Plus size={16} color={INK} /></button>} />
      <div className="mx-4 mt-3 rounded-xl relative overflow-hidden" style={{ height: 110, background: "#E9F2EA" }}>
        <span className="absolute top-2 left-2.5 text-[9px] font-bold uppercase tracking-wide" style={{ ...mono, color: "#5C8E68" }}>Vue d'ensemble des points officiels</span>
        {collectionPoints.map((_, i) => (
          <div key={i} className="absolute flex flex-col items-center" style={{ top: [40, 70, 30][i], left: [50, 130, 210][i] }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: GREEN, ...mono }}>{i + 1}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 px-4 py-3 flex flex-col gap-2 overflow-y-auto">
        {collectionPoints.map((p, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl px-3.5 py-3" style={{ border: `1px solid ${LINE}` }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GREEN_LIGHT }}>
                <MapPin size={14} color={GREEN} />
              </div>
              <div>
                <p className="text-[13px] font-bold" style={{ ...display, color: INK }}>{p.name}</p>
                <p className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>{p.hours}</p>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => setShowForm(true)} className="mt-2 rounded-xl py-3 flex items-center justify-center gap-2" style={{ border: `1.5px dashed ${LINE}` }}>
          <Plus size={15} color="#8A857C" />
          <span className="text-[12px] font-bold" style={{ ...display, color: "#8A857C" }}>Ajouter un point de collecte</span>
        </button>
      </div>
    </div>
  );
}

function CitizensScreen({ goAgent, selectCitizen }) {
  const statusCfg = {
    fiable: { label: "Fiable", color: GREEN, bg: GREEN_LIGHT, Icon: ShieldCheck },
    surveiller: { label: "À surveiller", color: AMBER, bg: AMBER_LIGHT, Icon: ShieldAlert },
    suspendu: { label: "Suspendu", color: RED, bg: "#FBEBEC", Icon: ShieldX },
  };
  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Gestion des citoyens" onBack={() => goAgent("dashboard")} right={<Printer size={16} color={INK} />} />
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ border: `1px solid ${LINE}` }}>
          <Search size={14} color="#8A857C" />
          <span className="text-[12px]" style={{ ...mono, color: "#8A857C" }}>Rechercher un citoyen...</span>
        </div>
        <div className="flex gap-1.5 mt-2 overflow-x-auto">
          {["Tous", "Fiables", "À surveiller", "Suspendus"].map((f, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap" style={{ ...mono, border: `1px solid ${LINE}`, color: i === 0 ? "#fff" : "#6B665C", background: i === 0 ? INK : "#fff" }}>{f}</span>
          ))}
        </div>
      </div>
      <div className="flex-1 px-4 py-3 flex flex-col gap-2 overflow-y-auto">
        {citizens.map((c) => {
          const cfg = statusCfg[c.status];
          const Icon = cfg.Icon;
          return (
            <button key={c.id} onClick={() => { selectCitizen(c); goAgent("citizenDetail"); }} className="flex items-center justify-between rounded-xl px-3.5 py-3 text-left" style={{ border: `1px solid ${LINE}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: "#6B665C", ...mono }}>
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-[13px] font-bold" style={{ ...display, color: INK }}>{c.name}</p>
                  <p className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>{c.points} pts · {c.reports} signalements</p>
                </div>
              </div>
              <Badge color={cfg.color} bg={cfg.bg}><Icon size={10} style={{ display: "inline", marginRight: 3, marginBottom: -1 }} />{cfg.label}</Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CitizenDetailScreen({ goAgent, citizen }) {
  const [warned, setWarned] = useState(false);
  const c = citizen || citizens[0];
  const validated = Math.round((c.reliability / 100) * c.reports);
  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Fiche citoyen" onBack={() => goAgent("citizens")} />
      <div className="flex flex-col items-center pt-5 pb-3">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 text-[16px] font-bold text-white" style={{ background: "#6B665C", ...mono }}>
          {c.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <p className="text-[14px] font-extrabold" style={{ ...display, color: INK }}>{c.name}</p>
        <p className="text-[11px]" style={{ ...mono, color: "#8A857C" }}>{c.city} · inscrit le 03/02/2026</p>
      </div>

      <div className="px-5 grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-xl py-2.5 text-center" style={{ background: AMBER_LIGHT }}>
          <p className="text-[15px] font-extrabold" style={{ ...mono, color: AMBER }}>{c.points}</p>
          <p className="text-[9px] font-semibold" style={{ ...display, color: "#8A857C" }}>points</p>
        </div>
        <div className="rounded-xl py-2.5 text-center" style={{ background: "#EDEAE3" }}>
          <p className="text-[15px] font-extrabold" style={{ ...mono, color: INK }}>{c.reports}</p>
          <p className="text-[9px] font-semibold" style={{ ...display, color: "#8A857C" }}>signalements</p>
        </div>
        <div className="rounded-xl py-2.5 text-center" style={{ background: GREEN_LIGHT }}>
          <p className="text-[15px] font-extrabold" style={{ ...mono, color: GREEN }}>{c.reliability}%</p>
          <p className="text-[9px] font-semibold" style={{ ...display, color: "#8A857C" }}>fiabilité</p>
        </div>
      </div>

      <div className="px-5 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ ...mono, color: "#8A857C" }}>Historique</p>
        <div className="flex items-center justify-between text-[12px]" style={{ ...display, color: INK }}>
          <span>{validated} validés</span>
          <span style={{ color: "#8A857C" }}>{c.reports - validated} rejetés</span>
        </div>
      </div>

      <div className="mt-auto px-5 pb-6 flex flex-col gap-2">
        {!warned ? (
          <button onClick={() => setWarned(true)} className="w-full rounded-xl py-3 text-[13px] font-bold flex items-center justify-center gap-2" style={{ border: `1.5px solid ${AMBER}`, color: AMBER, ...display }}>
            <ShieldAlert size={15} /> Avertir l'utilisateur
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5" style={{ background: AMBER_LIGHT }}>
            <Check size={14} color={AMBER} />
            <span className="text-[11px] font-bold" style={{ ...display, color: AMBER }}>Avertissement envoyé — suspension possible si ça persiste</span>
          </div>
        )}
        <button disabled={!warned} className="w-full rounded-xl py-3 text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: RED, color: "#fff", ...display }}>
          <ShieldX size={15} /> Suspendre le compte
        </button>
      </div>
    </div>
  );
}

// ---------- ROOT ----------

export default function HysacamPrototype() {
  const [persona, setPersona] = useState("citizen");
  const [screen, setScreen] = useState("home");
  const [agentScreen, setAgentScreen] = useState("dashboard");
  const [selectedCitizen, setSelectedCitizen] = useState(citizens[0]);

  const go = (s) => setScreen(s);
  const goAgent = (s) => setAgentScreen(s);
  const showTabBar = ["home", "map", "history", "profile"].includes(screen);

  const renderCitizen = () => {
    switch (screen) {
      case "login": return <LoginScreen />;
      case "home": return <HomeScreen go={go} />;
      case "notifications": return <NotificationsScreen go={go} />;
      case "capture": return <CaptureScreen go={go} />;
      case "confirm": return <ConfirmScreen go={go} />;
      case "success": return <SuccessScreen go={go} />;
      case "map": return <MapScreen go={go} />;
      case "history": return <HistoryScreen go={go} />;
      case "profile": return <ProfileScreen go={go} />;
      default: return <HomeScreen go={go} />;
    }
  };

  const renderAgent = () => {
    switch (agentScreen) {
      case "dashboard": return <DashboardScreen goAgent={goAgent} />;
      case "treatment": return <TreatmentScreen />;
      case "points": return <PointsScreen />;
      case "citizens": return <CitizensScreen goAgent={goAgent} selectCitizen={setSelectedCitizen} />;
      case "citizenDetail": return <CitizenDetailScreen goAgent={goAgent} citizen={selectedCitizen} />;
      default: return <DashboardScreen goAgent={goAgent} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-8 px-4" style={{ background: "#F0EFEC", ...display }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=JetBrains+Mono:wght@500;700&display=swap');`}</style>

      <div className="flex flex-col items-center mb-5 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ ...mono, color: "#8A857C" }}>Prototype interactif</span>
        <h1 className="text-[20px] font-extrabold mt-1" style={{ color: INK }}>Application HYSACAM — 14 écrans</h1>
      </div>

      <div className="flex rounded-full p-1 mb-5" style={{ background: "#E6E3DD" }}>
        {[
          { id: "citizen", label: "Vue Citoyen" },
          { id: "agent", label: "Vue Agent HYSACAM" },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            className="px-4 py-2 rounded-full text-[12px] font-bold transition-colors"
            style={{
              background: persona === p.id ? (p.id === "citizen" ? RED : GREEN) : "transparent",
              color: persona === p.id ? "#fff" : "#6B665C",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 mb-6 max-w-md">
        {(persona === "citizen" ? CITIZEN_SCREENS : AGENT_SCREENS).map((s) => {
          const activeId = persona === "citizen" ? screen : agentScreen;
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => (persona === "citizen" ? setScreen(s.id) : setAgentScreen(s.id))}
              className="px-2.5 py-1.5 rounded-full text-[10px] font-bold"
              style={{
                ...mono,
                border: `1px solid ${isActive ? INK : LINE}`,
                background: isActive ? INK : "#fff",
                color: isActive ? "#fff" : "#6B665C",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Phone frame */}
      <div className="rounded-[2.4rem] p-3" style={{ background: "#0E0E0C", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>
        <div className="w-[300px] h-[620px] rounded-[1.9rem] overflow-hidden flex flex-col relative" style={{ background: PAPER }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 rounded-b-xl z-10" style={{ background: "#0E0E0C" }} />
          <StatusBar />
          {persona === "citizen" ? renderCitizen() : renderAgent()}
          {persona === "citizen" && showTabBar && <TabBar active={screen} onNav={go} />}
        </div>
      </div>

      <p className="text-[11px] mt-5 max-w-sm text-center" style={{ ...mono, color: "#8A857C" }}>
        Utilisez les pastilles ci-dessus pour naviguer entre les écrans, ou suivez le parcours réel via les boutons à l'intérieur du téléphone.
      </p>
    </div>
  );
}
