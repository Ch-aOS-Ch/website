/**
 * Ch-aOS Code Window WebGL Glass Sheen & Spotlight Borders (v2.5)
 *
 * Efeito sutil e translúcido de reflexo em superfície de vidro com
 * iluminação spotlight nas bordas externas e divisória do code header.
 */

(function () {
  'use strict';

  const CONFIG = {
    maxPop: 0.012,
    maxShift: 0.1,
    slant: 0.358,
    coreWidth: 1.6,
    bloomWidth: 5.6,
    rimLobeWidth: 10.0,
    spanScale: 0.054,
    coreStrength: 0.3,
    bloomStrength: 0.18,
    rimStrength: 0.9,
    rimGlowWidth: 0.133,
    rimHairline: 0.625,
    rimTopBias: 0.331
  };

  const BASE_DURATION = 440;
  const POP_PEAK = 0.42;

  function computeCurve(progress) {
    if (progress < 0 || progress >= 1) return null;
    const popT = progress < POP_PEAK ? progress / POP_PEAK : (1 - progress) / (1 - POP_PEAK);
    const pop = (1 - Math.cos(popT * Math.PI)) / 2;
    const sheenWindow = Math.min(POP_PEAK, 1 - POP_PEAK);
    const sheenT = progress / (2 * sheenWindow);
    const sheen = (sheenT >= 0 && sheenT <= 1) ? (1 - Math.cos(sheenT * Math.PI)) / 2 : -1;
    return { pop, sheen };
  }

  function computePhysics(width, height, lineHeight) {
    const amplitude = Math.min(
      CONFIG.maxPop,
      (lineHeight * CONFIG.maxShift) / Math.max(Math.max(width, height) / 2, 1)
    );
    const diagonalLines = (width + height * CONFIG.slant + height * 2) / lineHeight;
    const slowdownFactor = Math.min(Math.max((diagonalLines - 10) / 60, 0), 1);
    const duration = BASE_DURATION * (1 + 0.35 * slowdownFactor);
    return { amplitude, duration };
  }

  const VERTEX_SHADER_SRC = `
attribute vec2 corner;
void main() {
    gl_Position = vec4(corner, 0.0, 1.0);
}
`;

  const FRAGMENT_SHADER_SRC = `
precision highp float;

uniform vec2 size;
uniform float line;
uniform float radius;
uniform float sheen;
uniform float is_light;
uniform float divider_y; // Posição Y da borda divisória entre header e body (0.0 se não houver)

void main() {
    vec2 pixel = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);

    // Contorno suave da janela com cantos arredondados
    vec2 from_center = pixel - size * 0.5;
    vec2 corner = abs(from_center) - (size * 0.5 - radius);
    float outside = length(max(corner, 0.0)) + min(max(corner.x, corner.y), 0.0) - radius;
    float coverage = clamp(0.5 - outside, 0.0, 1.0);

    // Feixe diagonal de reflexo de vidro
    float slant = 0.3580;
    float diagonal = pixel.x + pixel.y * slant;
    float span = size.x + size.y * slant;

    // Largura ampla para parecer reflexo em placa de vidro, não feixe fino de laser
    float band_width = max(line * 4.2, span * 0.16);
    float reach = band_width * 2.5;
    float offset = diagonal - mix(-reach, span + reach, sheen);

    // Envelope suave de entrada e saída
    float envelope = smoothstep(0.0, 0.18, sheen) * (1.0 - smoothstep(0.82, 1.0, sheen));

    // Curva contínua e suave de reflexo (feixe principal largo + cauda difusa suave)
    float d = abs(offset);
    float beam_core = exp(-pow(d / band_width, 2.0));
    float beam_soft = exp(-pow(d / (band_width * 2.2), 2.0));
    float beam = (beam_core * 0.75 + beam_soft * 0.25) * envelope;

    // ==============================================================
    // SPOTLIGHT GLOW NAS BORDAS (OUTER RIMS + DIVISÓRIA HEADER)
    // ==============================================================
    // 1. Borda externa do code window (outer border)
    float depth = max(-outside, 0.0);
    float border_thickness = max(line * 0.08, 1.5);
    float outer_border_mask = exp(-depth / border_thickness);

    // 2. Borda divisória entre code header e code body (divider border)
    float divider_border_mask = 0.0;
    if (divider_y > 0.0) {
        float dist_div = abs(pixel.y - divider_y);
        divider_border_mask = exp(-dist_div / (border_thickness * 1.15));
    }

    // Combina as bordas: externa e interna (header border)
    float total_border_mask = max(outer_border_mask, divider_border_mask);

    // O spotlight de borda segue o feixe com fade suave (spotlight beam)
    // Usamos um envelope um pouco mais estendido para a luz correr suave nas bordas
    float border_beam = exp(-pow(d / (band_width * 1.35), 2.0)) * envelope;
    float border_spotlight = total_border_mask * border_beam;

    if (is_light > 0.5) {
        // ==============================================================
        // MODO CLARO:
        // Cores da paleta: Verde luminoso / Menta (#137A5B / #63E6BE / #A2DCB7)
        // ==============================================================
        vec3 edge_green = vec3(0.35, 0.88, 0.65); // #5AE0A6
        vec3 center_mint = vec3(0.58, 0.98, 0.80); // #94FACC
        vec3 glass_color = mix(edge_green, center_mint, beam_core);

        // Cor de spotlight para as bordas: verde vivo e bem visível
        vec3 border_color = vec3(0.08, 0.65, 0.46); // #14A675
        vec3 lit_border = mix(border_color, vec3(0.40, 0.95, 0.75), border_beam);

        // Alpha da superfície de vidro + intensidade do spotlight de borda
        float surface_alpha = clamp(beam * 0.60 * coverage, 0.0, 0.68);
        float border_alpha = clamp(border_spotlight * 0.85 * coverage, 0.0, 0.90);

        // Composição da cor final
        vec3 final_rgb = mix(glass_color, lit_border, border_spotlight * 0.85);
        float final_alpha = clamp(surface_alpha + border_alpha, 0.0, 0.92);

        gl_FragColor = vec4(final_rgb * final_alpha, final_alpha);
    } else {
        // ==============================================================
        // MODO ESCURO:
        // Cores da paleta: Brand Mint (#38D9A9) e Destaque (#7CFAD3)
        // Usando screen blend. Fora do feixe, RGB é estritamente 0 (100% transparente).
        // ==============================================================
        vec3 mint_base = vec3(0.22, 0.85, 0.66); // #38D9A9
        vec3 highlight = vec3(0.70, 1.0, 0.90); // #B3FFE6
        vec3 lit_color = mix(mint_base, highlight, beam_core * 0.75);

        // Cor do spotlight na borda: mint radiante (#38D9A9 / #7CFAD3)
        vec3 border_mint = mix(vec3(0.22, 0.85, 0.66), vec3(0.85, 1.0, 0.95), border_beam);

        // Superfície com opacidade moderada + borda com brilho elevado
        float surface_amount = beam * 0.75 * coverage;
        float border_amount = border_spotlight * 1.10 * coverage;

        vec3 final_rgb = lit_color * surface_amount + border_mint * border_amount;
        float final_alpha = clamp(surface_amount + border_amount, 0.0, 0.95);

        gl_FragColor = vec4(final_rgb, final_alpha);
    }
}
`;

  let cachedRenderer = null;

  function createRenderer() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: true });
    if (!gl) return null;

    const program = gl.createProgram();
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VERTEX_SHADER_SRC);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) return null;
    gl.attachShader(program, vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, FRAGMENT_SHADER_SRC);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) return null;
    gl.attachShader(program, fs);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const cornerAttr = gl.getAttribLocation(program, 'corner');
    gl.enableVertexAttribArray(cornerAttr);
    gl.vertexAttribPointer(cornerAttr, 2, gl.FLOAT, false, 0, 0);

    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;pointer-events:none;z-index:30;top:0;left:0;width:100%;height:100%;';

    return {
      canvas,
      gl,
      uniform: (name) => gl.getUniformLocation(program, name)
    };
  }

  let activeCancel = null;

  function runShaderSheen(windowElement) {
    if (!windowElement) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (activeCancel) {
      activeCancel();
    }

    if (!cachedRenderer || cachedRenderer.gl.isContextLost()) {
      cachedRenderer = createRenderer();
    }
    if (!cachedRenderer) return;

    const { canvas, gl, uniform } = cachedRenderer;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const winStyle = window.getComputedStyle(windowElement);
    const width = windowElement.offsetWidth;
    const height = windowElement.offsetHeight;
    if (width === 0 || height === 0) return;

    const lineHeight = 24;
    const { amplitude, duration } = computePhysics(width, height, lineHeight);

    if (winStyle.position === 'static') {
      windowElement.style.position = 'relative';
    }
    const previousOverflow = windowElement.style.overflow;
    windowElement.style.overflow = 'hidden';

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.borderRadius = winStyle.borderRadius || '0px';

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    canvas.style.mixBlendMode = isLight ? 'normal' : 'screen';

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniform('size'), canvas.width, canvas.height);
    gl.uniform1f(uniform('line'), lineHeight * dpr);
    gl.uniform1f(uniform('radius'), Math.min(parseFloat(winStyle.borderTopLeftRadius) || 0, width / 2, height / 2) * dpr);
    gl.uniform1f(uniform('is_light'), isLight ? 1.0 : 0.0);

    // Identifica se há um header de janela para acender a borda divisória (code header border)
    const headerEl = windowElement.querySelector('.code-window-header, .header, [class*="header"]');
    let dividerY = 0.0;
    if (headerEl) {
      const headerRect = headerEl.getBoundingClientRect();
      const winRect = windowElement.getBoundingClientRect();
      dividerY = (headerRect.bottom - winRect.top) * dpr;
    }
    gl.uniform1f(uniform('divider_y'), dividerY);

    windowElement.appendChild(canvas);

    windowElement.style.transformOrigin = '50% 50%';
    windowElement.style.willChange = 'transform';

    const uSheen = uniform('sheen');
    let startTime = null;
    let rafId = null;

    function frame(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = elapsed / duration;
      const curve = computeCurve(progress);

      if (!curve) {
        cleanup();
        return;
      }

      windowElement.style.transform = `scale(${1 + amplitude * curve.pop})`;

      if (cachedRenderer) {
        gl.uniform1f(uSheen, curve.sheen);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (curve.sheen >= 0) {
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      }

      rafId = requestAnimationFrame(frame);
    }

    function cleanup() {
      if (rafId) cancelAnimationFrame(rafId);
      canvas.remove();
      windowElement.style.transform = '';
      windowElement.style.transformOrigin = '';
      windowElement.style.willChange = '';
      windowElement.style.overflow = previousOverflow;
      activeCancel = null;
    }

    activeCancel = cleanup;
    rafId = requestAnimationFrame(frame);
  }

  // Identifica a janela de código inteira (englobando header e body)
  function findCodeWindow(btn) {
    const codeWindowCard = btn.closest('.code-window-card');
    if (codeWindowCard) return codeWindowCard;

    const ecFrame = btn.closest('.expressive-code .frame, figure.expressive-code, .expressive-code');
    if (ecFrame) return ecFrame;

    const quickstartBox = btn.closest('.quickstart-code-box');
    if (quickstartBox) return quickstartBox;

    const genericBox = btn.closest('.code-block, pre, div[class*="code"], div[class*="terminal"]');
    if (genericBox) return genericBox;

    return btn.parentElement || btn;
  }

  function handleCopyClick(e) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const btn = e.target.closest('.copy-code-btn, .copy-quickstart, .expressive-code .copy button, button[data-code], .copy-code');
    if (!btn) return;

    const codeWindow = findCodeWindow(btn);
    if (codeWindow) {
      runShaderSheen(codeWindow);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener('click', handleCopyClick, true);
    });
  } else {
    document.addEventListener('click', handleCopyClick, true);
  }

  document.addEventListener('astro:page-load', () => {
    // Mantém o listener ativo
  });

  window.triggerChaosCodeShader = function (target) {
    const win = target ? (target.nodeType ? findCodeWindow(target) : null) : null;
    if (win) runShaderSheen(win);
  };
})();
