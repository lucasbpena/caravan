import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';

export function RulesOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button - Fixed in bottom-right corner */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          absolute top-25 left-4 z-50
          bg-amber-200 hover:bg-amber-700
					cursor-pointer
          text-zinc-800
          p-2 rounded-full
          shadow-2xl
          transition-all duration-300
          hover:scale-110
        "
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
            bg-gradient-to-br from-amber-50 to-amber-100
            rounded-2xl shadow-2xl
            overflow-hidden
            animate-in zoom-in-95 slide-in-from-bottom-4 duration-300
            border-8 border-amber-600
          ">
            {/* Header */}
            <div className="
              bg-gradient-to-r from-amber-600 to-amber-700
              px-6 py-4
              flex items-center justify-between
              border-b-4 border-amber-800
            ">
              <h2 className="text-3xl font-black text-white font-['Overseer']">
                🎴 Caravan Rules
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="
                  text-white hover:text-amber-200
                  transition-colors p-2
                  hover:bg-white/20 rounded-lg
                "
                aria-label="Close rules"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="
              p-8
              overflow-y-auto
              max-h-[calc(85vh-80px)]
              text-gray-800
            ">
              {/* Objective */}
              <section className="mb-8">
                <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                  🎯 Objective
                </h3>
                <p className="text-lg leading-relaxed">
                  Build three opposing piles (or "caravans") of numbered cards. 
                  Outbid your opponent's caravan with the highest value without being 
                  too light <span className="font-bold text-red-600">(under 21)</span> or 
                  overburdened <span className="font-bold text-red-600">(over 26)</span>.
                </p>
              </section>

              {/* Setup */}
              <section className="mb-8">
                <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                  🃏 Setup
                </h3>
                <p className="text-lg leading-relaxed mb-3">
                  Each player takes <span className="font-bold">8 cards</span> from their deck 
                  and places either one numerical card or ace on each of their three caravans.
                </p>
                <p className="text-lg font-semibold text-red-600">
                  ⚠️ Players may NOT discard during this initial round.
                </p>
              </section>

              {/* Turn Actions */}
              <section className="mb-8">
                <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                  ⚡ Your Turn
                </h3>
                <p className="text-lg leading-relaxed mb-4">
                  Once both players have started their caravans, you may do <span className="font-bold">ONE</span> of the following:
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="text-lg flex items-start gap-3">
                    <span className="text-2xl">1️⃣</span>
                    <span>Play one card and draw a new card from your deck</span>
                  </li>
                  <li className="text-lg flex items-start gap-3">
                    <span className="text-2xl">2️⃣</span>
                    <span>Discard one card from your hand and draw a new card</span>
                  </li>
                  <li className="text-lg flex items-start gap-3">
                    <span className="text-2xl">3️⃣</span>
                    <span>Discard one of your caravans (remove all cards from that pile)</span>
                  </li>
                </ul>
              </section>

              {/* Caravan Rules */}
              <section className="mb-8">
                <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                  📊 Caravan Direction & Suit
                </h3>
                <div className="bg-white/70 p-5 rounded-xl border-2 border-amber-300 space-y-3">
                  <p className="text-lg leading-relaxed">
                    <span className="font-bold text-amber-900">First card:</span> Determines the <span className="font-bold">suit</span>
                  </p>
                  <p className="text-lg leading-relaxed">
                    <span className="font-bold text-amber-900">Second card:</span> Determines the <span className="font-bold">direction</span> (ascending ⬆️ or descending ⬇️)
                  </p>
                  <p className="text-lg leading-relaxed">
                    <span className="font-bold text-amber-900">Following cards:</span> Must continue the numerical direction OR match the suit
                  </p>
                  <p className="text-lg font-semibold text-red-600">
                    ⚠️ Cards of the same value cannot be played in sequence
                  </p>
                </div>
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