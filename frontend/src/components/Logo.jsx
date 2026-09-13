import { Home } from "lucide-react";
export default function Logo({ compact = false }) { return <div className="logo"><span className="logo-mark"><Home size={19}/></span>{!compact && <span>Echo<span>Dwell</span></span>}</div>; }
