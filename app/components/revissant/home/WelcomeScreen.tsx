import {useEffect, useState} from 'react';
import {useLockBodyScroll} from '~/components/revissant/hooks/useLockBodyScroll';

type WelcomeScreenProps = {
  onFinished: () => void;
};

/**
 * WelcomeScreen (REVISSANT) - versão com LOGO WHITE.
 * - Mostra o overlay
 * - Aguarda brevemente
 * - Faz fade-out curto
 * - Chama onFinished()
 *
 * SSR-safe: window só dentro de useEffect.
 */
export function WelcomeScreen({onFinished}: WelcomeScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const displayMs = 1400;
  const fadeMs = 500;

  // Bloquear scroll enquanto estiver visível
  useLockBodyScroll(true);

  useEffect(() => {
    let finishTimer: number | undefined;

    const timer = window.setTimeout(() => {
      setIsVisible(false);

      // esperar o fade-out antes de finalizar
      finishTimer = window.setTimeout(() => {
        onFinished();
      }, fadeMs);
    }, displayMs);

    return () => {
      window.clearTimeout(timer);
      if (finishTimer) window.clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={[
        'fixed inset-0 z-[200] flex items-center justify-center',
        'transition-opacity duration-500 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      style={{backgroundColor: '#0F2445'}}
    >
      <div className="text-center relative flex flex-col items-center">
        {/* Logo (mantemos o logotipo) */}
        <img
          src="/logowhite.png"
          alt="REVISSANT"
          className="w-[430px] sm:w-[560px] md:w-[700px] max-w-[92vw] h-auto select-none animate-fade-in"
          style={{marginTop: 'clamp(4px, 0.8vw, 10px)'}}
          draggable={false}
        />

        {/* Bloco linha + frase com offset explícito para evitar conflito de utilitários */}
        <div
          className="flex flex-col items-center"
          style={{transform: 'translateY(clamp(-152px, -19vw, -230px))'}}
        >
          {/* Divider Line Animation */}
          <div className="h-px bg-blue-200/50 w-0 mx-auto animate-[width_800ms_ease-out_forwards_200ms] mb-6" />

          {/* Welcome Text Animation */}
          <p className="m-0 text-blue-100 font-sans text-xs md:text-sm tracking-[0.4em] uppercase opacity-0 animate-[fadeIn_600ms_ease-out_forwards_550ms]">
            Welcome to the new standard
          </p>
        </div>
      </div>

      {/* CSS local para animar sem mexer em estilos globais */}
      <style>{`
        @keyframes width {
          from { width: 0; }
          to { width: 100px; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
