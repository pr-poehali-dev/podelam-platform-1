import React from "react";
import PaywallModal from "@/components/PaywallModal";
import DiaryChat from "@/components/diary/DiaryChat";
import DiaryHistory from "@/components/diary/DiaryHistory";
import DiaryHeader from "@/components/diary/DiaryHeader";
import { useDiarySession } from "@/components/diary/useDiarySession";

export default function Diary() {
  const s = useDiarySession();

  if (s.showPaywall) {
    return (
      <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>
        <PaywallModal
          toolId="diary"
          toolName="Дневник самоанализа"
          onClose={() => s.navigate("/cabinet?tab=tools")}
          onSuccess={() => s.setShowPaywall(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>
      <DiaryHeader
        onBack={() => s.navigate("/cabinet?tab=tools")}
        phase={s.phase}
        stageNumber={s.stageNumber}
        entries={s.entries}
        tab={s.tab}
        onTabChange={s.setTab}
      />

      {s.tab === "history" ? (
        <DiaryHistory entries={s.entries} />
      ) : (
        <DiaryChat
          messages={s.messages}
          input={s.input}
          onInputChange={s.setInput}
          onSend={s.handleSend}
          onButtonSelect={s.handleButtonSelect}
          onChipsConfirm={s.handleChipsConfirm}
          onSliderConfirm={s.handleSliderConfirm}
          onFinish={s.handleFinish}
          onStartNew={s.startNew}
          phase={s.phase}
          currentInputMode={s.inputMode}
          currentButtons={s.currentButtons}
          currentChips={s.currentChips}
          currentSlider={s.currentSlider}
          bottomRef={s.bottomRef as React.RefObject<HTMLDivElement>}
          stageNumber={s.stageNumber}
          canAddMore={s.canAddMore}
          onAddMore={s.handleAddMore}
          addMoreLabel={s.addMoreLabel}
        />
      )}
    </div>
  );
}
