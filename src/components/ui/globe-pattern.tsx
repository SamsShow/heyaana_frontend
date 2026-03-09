"use client";

import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";

/*
 * Equirectangular world-map data at ~120×50 resolution.
 * Each row is a string: '#' = land, ' ' = ocean.
 * We convert lat/lon → 3-D sphere → orthographic projection for a round globe.
 */
const WORLD_MAP: string[] = [
  "                                                                                                                        ",
  "                                                                                                                        ",
  "                                         ##                    ########                                                  ",
  "                                       ####                  ###########                                                 ",
  "                            ##        ######    ##         ##############  ##                                             ",
  "                   ####   ######     ########  ####       ################  ##                                            ",
  "                  ######  #######   #########  #####     ################## ###                                           ",
  "                 ######## ########  ######### ######    ################### ###                                           ",
  "                ###############################################  ########## ####                                          ",
  "               #################################################  ######### ####                                         ",
  "              ################################################### ######### #####                                        ",
  "             ######################################################################                                      ",
  "             ######################################################  ##############                                      ",
  "            ######################################################    #############                                      ",
  "           #######################################################     ############  ##                                  ",
  "           ########################################################     ###########  ###                                 ",
  "          #########################################################      ##########  ###                                 ",
  "          ########################################################        #########  ###                                 ",
  "           ######################################################          ########  ##                                  ",
  "           #####################################################            #######                                      ",
  "            ####################################################            ######                                       ",
  "            ##################################################               #####                                       ",
  "             ################################################                  ###                                       ",
  "             ###############################################                    ##                                       ",
  "              #############################################                                                              ",
  "              ############################################                                                               ",
  "               ##########################################                                                                ",
  "                ########################################                                                                  ",
  "                 ######################################                     #                                             ",
  "                  ####################################                    ###                                             ",
  "                   ##################################                   #####                                             ",
  "                    ################################                   ######                                             ",
  "                      #############################                   #######                                            ",
  "                        ##########################                    ########                                           ",
  "                          #######################                      ########                                          ",
  "                            ####################              ###       ########                                         ",
  "                              #################             #####        ########                                        ",
  "                                ###############            ######         #######                                        ",
  "                                  ############            #######          ######                                        ",
  "                                    ##########            ########          #####                                        ",
  "                                      ########            #########          ####                                        ",
  "                                        ######             ########           ###                                        ",
  "                                          ####              ########          ##                                         ",
  "                                           ###               ########                                                    ",
  "                                            ##                ########                                                   ",
  "                                             #                 #######                                                   ",
  "                                                                ######                                                  ",
  "                                                                 ####                                                   ",
  "                                                                  ##                                                    ",
  "                                                                                                                        ",
];

const MAP_ROWS = WORLD_MAP.length;
const MAP_COLS = WORLD_MAP[0]!.length;

interface GlobePatternProps {
  className?: string;
  color?: string;
  dotRadius?: number;
  dotSpacing?: number;
  flickerSpeed?: number;
  rotationLon?: number; // longitude offset in degrees (centres the view)
}

export const GlobePattern: React.FC<GlobePatternProps> = ({
  className = "",
  color = "#466EFF",
  dotRadius = 2.2,
  dotSpacing = 3.6,     // degrees between dots on the sphere
  flickerSpeed = 0.06,
  rotationLon = 20,     // tilt slightly to show Europe/Africa centred
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Pre-compute land lookup for fast sampling
  const isLand = useCallback((latDeg: number, lonDeg: number): boolean => {
    // Map lat (-90..90) → row (0..MAP_ROWS-1), lon (-180..180) → col (0..MAP_COLS-1)
    const row = Math.round(((90 - latDeg) / 180) * (MAP_ROWS - 1));
    const col = Math.round(((lonDeg + 180) / 360) * (MAP_COLS - 1));
    if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return false;
    return WORLD_MAP[row]![col] === "#";
  }, []);

  // Generate evenly-spaced sphere dots with lat/lon → 3D coords
  const sphereDots = useMemo(() => {
    const dots: { lat: number; lon: number; land: boolean }[] = [];
    for (let lat = 90; lat >= -90; lat -= dotSpacing) {
      for (let lon = -180; lon < 180; lon += dotSpacing) {
        dots.push({ lat, lon, land: isLand(lat, lon) });
      }
    }
    return dots;
  }, [dotSpacing, isLand]);

  const rgbaBase = useMemo(() => {
    if (typeof window === "undefined") return "rgba(70, 110, 255,";
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const cx = c.getContext("2d");
    if (!cx) return "rgba(70, 110, 255,";
    cx.fillStyle = color;
    cx.fillRect(0, 0, 1, 1);
    const [r, g, b] = Array.from(cx.getImageData(0, 0, 1, 1).data);
    return `rgba(${r}, ${g}, ${b},`;
  }, [color]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number, opacities: Float32Array) => {
      ctx.clearRect(0, 0, w * dpr, h * dpr);

      const radius = Math.min(w, h) * 0.46; // globe radius in CSS px
      const cx = w / 2;
      const cy = h / 2;
      const toRad = Math.PI / 180;
      const lonOff = rotationLon * toRad;

      // Draw sphere outline — makes it clearly recognisable as a globe
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx * dpr, cy * dpr, radius * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = `${rgbaBase}0.25)`;
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // Subtle inner sphere tint for depth
      const grad = ctx.createRadialGradient(
        (cx - radius * 0.15) * dpr, (cy - radius * 0.2) * dpr, 0,
        cx * dpr, cy * dpr, radius * dpr,
      );
      grad.addColorStop(0, `${rgbaBase}0.04)`);
      grad.addColorStop(1, `${rgbaBase}0.0)`);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < sphereDots.length; i++) {
        const d = sphereDots[i]!;
        const lat = d.lat * toRad;
        const lon = d.lon * toRad + lonOff;

        // Orthographic projection — only draw front-facing hemisphere
        const cosLat = Math.cos(lat);
        const x3d = cosLat * Math.sin(lon);
        const y3d = -Math.sin(lat);
        const z3d = cosLat * Math.cos(lon);

        if (z3d < 0) continue; // behind the globe

        const screenX = cx + x3d * radius;
        const screenY = cy + y3d * radius;

        // Depth-based sizing and brightness — dots near edges are dimmer/smaller
        const depthFactor = 0.3 + z3d * 0.7;
        const r = dotRadius * depthFactor * dpr;

        let alpha: number;
        if (d.land) {
          alpha = opacities[i]! * depthFactor;
        } else {
          // Ocean dots — visible enough to show the sphere is round
          alpha = 0.14 * depthFactor;
        }

        ctx.fillStyle = `${rgbaBase}${alpha})`;
        ctx.beginPath();
        ctx.arc(screenX * dpr, screenY * dpr, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [sphereDots, rgbaBase, dotRadius, rotationLon],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const opacities = new Float32Array(sphereDots.length);
    for (let i = 0; i < opacities.length; i++) {
      opacities[i] = sphereDots[i]!.land ? 0.3 + Math.random() * 0.5 : 0.04;
    }

    let animId: number;
    let lastTime = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    resize();

    const animate = (time: number) => {
      if (!isInView) return;
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      for (let i = 0; i < opacities.length; i++) {
        if (sphereDots[i]!.land && Math.random() < flickerSpeed * dt) {
          opacities[i] = 0.25 + Math.random() * 0.55;
        }
      }

      const w = container.clientWidth;
      const h = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      draw(ctx, w, h, dpr, opacities);
      animId = requestAnimationFrame(animate);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver(([e]) => setIsInView(!!e?.isIntersecting), { threshold: 0 });
    io.observe(canvas);

    if (isInView) animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
    };
  }, [sphereDots, draw, flickerSpeed, isInView]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="pointer-events-none" />
    </div>
  );
};
