import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronLeft, Loader2, MapPin, Info, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { IssueStatus, Issue, STATUS_LABELS } from '@/types';
import { issueService } from '@/services/issueService';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<IssueStatus, string> = {
  reported: '#3b82f6',     // Blue
  acknowledged: '#06b6d4', // Cyan
  verified: '#8b5cf6',     // Purple
  'in-progress': '#f59e0b', // Amber/Orange
  resolved: '#22c55e',     // Green
  rejected: '#ef4444',     // Red
  escalated: '#f43f5e',    // Rose/Pink
};

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Subscribe to real-time issues
    const unsubscribe = issueService.subscribeToAllIssues((data) => {
      setIssues(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // 2. Initialize map if not exists
    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        center: [12.9716, 77.5946],
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; Council Command Center | OSM',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstance.current = map;
    }

    const map = mapInstance.current;

    // 3. Update markers based on real-time data
    // Remove markers that are no longer in the list
    const issueIds = new Set(issues.map(i => i.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!issueIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    issues.forEach(issue => {
      const color = statusColors[issue.status];
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width:32px;
            height:32px;
            border-radius:50%;
            background:${color};
            border:3px solid white;
            box-shadow:0 10px 20px -5px ${color}60, 0 4px 6px -2px rgba(0,0,0,0.1);
            cursor:pointer;
            display:flex;
            items-center;
            justify-content:center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          ">
            <div style="width:8px;height:8px;border-radius:50%;background:white;opacity:0.8;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (markersRef.current[issue.id]) {
        // Update existing marker
        markersRef.current[issue.id].setLatLng([issue.latitude, issue.longitude]);
        markersRef.current[issue.id].setIcon(icon);
      } else {
        // Create new marker
        const marker = L.marker([issue.latitude, issue.longitude], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width:220px;padding:4px;font-family:Inter,system-ui,sans-serif;">
            <div style="display:flex;justify-content:between;align-items:center;margin-bottom:10px;">
              <span style="
                display:inline-block;
                padding:4px 10px;
                border-radius:10px;
                font-size:10px;
                font-weight:800;
                text-transform:uppercase;
                letter-spacing:0.05em;
                background:${color}15;
                color:${color};
              ">${STATUS_LABELS[issue.status]}</span>
              <span style="font-size:10px;color:#94a3b8;font-weight:600;">#${issue.id.slice(0, 4)}</span>
            </div>
            <p style="font-weight:800;font-size:15px;margin:0 0 6px;color:#0f172a;letter-spacing:-0.02em;">${issue.title}</p>
            <p style="font-size:12px;color:#64748b;margin:0 0 12px;line-height:1.5;font-weight:500;">${issue.description.slice(0, 100)}${issue.description.length > 100 ? '...' : ''}</p>
            <div style="display:flex;gap:4px;border-top:1px solid #f1f5f9;padding-top:10px;">
              <a href="/issues/${issue.id}" style="
                flex:1;
                background:#0f172a;
                color:white;
                text-decoration:none;
                padding:8px;
                border-radius:8px;
                text-align:center;
                font-size:11px;
                font-weight:700;
                display:flex;
                items-center;
                justify-content:center;
                gap:6px;
                transition:all 0.2s;
              ">View Full Report <span style="font-size:14px">→</span></a>
            </div>
          </div>
        `, {
          className: 'premium-popup',
          offset: [0, -10]
        });
        markersRef.current[issue.id] = marker;
      }
    });

  }, [issues]);

  return (
    <div className="fixed inset-0 z-0 bg-[#F8FAFC]">
      {/* HUD Header */}
      <div className="absolute top-6 left-6 right-6 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link
            to="/admin"
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-xl hover:bg-slate-50 transition-all group"
          >
            <ChevronLeft className="w-6 h-6 text-slate-900 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">Urban Control Grid</h1>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Real-time Command Visualization</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200 shadow-xl text-right pointer-events-auto">
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing...</span>
            </div>
          ) : (
            <>
              <p className="text-xl font-black text-slate-900 leading-none">{issues.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Identified Incidents</p>
            </>
          )}
        </div>
      </div>

      {/* Control Legend */}
      <div className="absolute bottom-10 left-6 z-[1000] bg-white p-6 rounded-[2rem] border border-slate-200 shadow-2xl w-48 transition-all hover:scale-105">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Status Legend</p>
        </div>
        <div className="space-y-3">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-3">
              <div
                style={{ background: color, boxShadow: `0 0 10px ${color}40` }}
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white"
              />
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{STATUS_LABELS[status as IssueStatus]}</span>
            </div>
          ))}
        </div>
      </div>

      <div ref={mapRef} className="w-full h-full" />

      <style dangerouslySetInnerHTML={{
        __html: `
        .leaflet-container { font-family: inherit; }
        .premium-popup .leaflet-popup-content-wrapper { 
          border-radius: 20px; 
          padding: 8px; 
          border: 1px solid #f1f5f9;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .premium-popup .leaflet-popup-tip { box-shadow: none; border: 1px solid #f1f5f9; }
        .custom-marker:hover div { transform: scale(1.2); z-index: 1000; }
      `}} />
    </div>
  );
}
