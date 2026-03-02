import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';

import cardBackRed from '../assets/1800-cards/back-red.png';


export function RulesOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button - Fixed in bottom-right corner */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          absolute top-25 left-4 z-50
          ${isOpen ? "bg-amber-700 text-white hover:bg-amber-200 hover:text-zinc-800" : "bg-amber-200 text-zinc-800 hover:bg-amber-700 hover:text-white"}          
					cursor-pointer
          p-2 rounded-full
          shadow-2xl
          transition-all duration-300
          hover:scale-110
          
        `}
        aria-label="Toggle game rules"
      >
        <BookOpen className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Rules Panel */}
          <div className="
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            w-[90vw] max-w-3xl max-h-[85vh]
            bg-white/40 border-2 border-amber-200
            pt-3
            rounded-2xl shadow-2xl
            overflow-hidden
            animate-in zoom-in-95 slide-in-from-bottom-4 duration-800
          ">
            {/* Header */}
            <div className="
              px-6 py-1
              flex items-center justify-between              
            ">
              <h2 className="text-3xl font-black text-white font-['Overseer']">
                🎴Caravana
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="
                  text-white hover:text-red-800
                  transition-colors
                  hover:bg-white/20 rounded-lg
                "
                aria-label="Close rules"
              >
                <X className="w-8 h-8 rounded-2xl bg-red-400 hover:cursor-pointer" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="
              p-8              
              max-h-[calc(60vh-80px)]
              overflow-y-auto
              text-white
            ">
              {/* Objective */}
              <section className="mb-8">
                <h5 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
                  🎯Objetivo
                </h5>
                <p>
                  Construir 2 pilhas com pontuação de <span className="font-bold text-red-300">21 a 26 pontos</span>, superando
                  o valor da pilha adversária.
                </p>
                <p>
                  Cartas com valor numérico (A,2,3,...,10) dão pontos a caravana
                  Cartas de figura são jogadas como anexos dos valores e tem efeitos especiais
                                    
                </p>
              </section>              

              {/* Ações do turno */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
                  ⚡ Ações do Turno
                </h3>
                <p className="text-lg leading-relaxed mb-4">
                  Depois de comprar 8 cartas e colocar um valor para abrir cada caravana, o jogador pode:
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="text-lg flex items-start gap-3">
                    <span className="text-2xl">1️⃣</span>
                    <span>Jogar uma carta de valor ou de figura</span>
                  </li>
                  <li className="text-lg flex items-start gap-3">
                    <span className="text-2xl">2️⃣</span>
                    <span>Descartar uma carta da mão e comprar outra <img source={cardBackRed}/></span>
                  </li>
                  <li className="text-lg flex items-start gap-3">
                    <span className="text-2xl">3️⃣</span>
                    <span>Descartar uma das suas caravana (remover pilha da mesa)</span>
                  </li>
                </ul>
              
                Caravanas são decrescentes ou crescentes, dependendo da ordem das duas primeiras cartas.
                Cartas numéricas são jogadas respeitando a direção ou o naipe da caravana (última carta jogada), e não se pode jogar cartas de mesmo valor em sequência.
                

                
              </section>
              

              {/* Face Cards */}
              <section className="mb-8">
                <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                  👑 Face Cards
                </h3>
                <p className="text-lg leading-relaxed mb-4">
                  Face cards can be attached to numeric cards in any caravan and affect them in various ways:
                </p>
                <div className="grid gap-4">
                  <div className="bg-purple-100 p-4 rounded-lg border-2 border-purple-400">
                    <span className="text-2xl font-bold text-purple-900">J - Jack:</span>
                    <span className="text-lg ml-2">Removes the card and all its attachments</span>
                  </div>
                  <div className="bg-pink-100 p-4 rounded-lg border-2 border-pink-400">
                    <span className="text-2xl font-bold text-pink-900">Q - Queen:</span>
                    <span className="text-lg ml-2">Changes the caravan's suit to the Queen's suit</span>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-400">
                    <span className="text-2xl font-bold text-blue-900">K - King:</span>
                    <span className="text-lg ml-2">Doubles the value of the attached card</span>
                  </div>
                  <div className="bg-orange-100 p-4 rounded-lg border-2 border-orange-400">
                    <span className="text-2xl font-bold text-orange-900">🃏 Joker:</span>
                    <span className="text-lg ml-2">Removes all cards with the same value (or suit if attached to an Ace)</span>
                  </div>
                </div>
              </section>

              {/* Winning */}
              <section className="mb-4">
                <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                  🏆 Winning
                </h3>
                <div className="bg-green-100 p-5 rounded-xl border-2 border-green-400">
                  <p className="text-lg leading-relaxed font-semibold">
                    Win by having the highest value in at least 2 out of 3 caravans, 
                    with each winning caravan scoring between 21-26 points!
                  </p>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </>
  );
}