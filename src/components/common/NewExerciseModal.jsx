import React, { useState } from "react";

const units = ["lbs", "kg", "body"];

export default function NewExerciseModal({ open, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [unit, setUnit] = useState("lbs");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || sets <= 0 || reps <= 0) return;
    onAdd({ name, sets, reps, weight, unit });
    setName("");
    setSets(0);
    setReps(0);
    setWeight(0);
    setUnit("lbs");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-[#353942] rounded-3xl p-6 w-full max-w-md mx-auto relative flex flex-col gap-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl z-10" aria-label="Close">×</button>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold text-white">New exercise</span>
            <button type="submit" className="text-white text-4xl font-bold" aria-label="Add">
              +
            </button>
          </div>
          <input
            className="rounded-xl px-4 py-3 text-xl bg-white text-[#5A6B7A] placeholder-[#5A6B7A] font-medium outline-none"
            placeholder="Exercise name"
            value={name}
            onChange={e => { setName(e.target.value); console.log('Name changed:', e.target.value); }}
            required
          />
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 text-xl">
            <span className="text-[#353942]">Sets</span>
            <input
              type="text"
              className="bg-transparent text-right w-12 outline-none"
              value={sets === 0 ? "" : sets}
              onChange={e => setSets(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 text-xl">
            <span className="text-[#353942]">Reps</span>
            <input
              type="text"
              className="bg-transparent text-right w-12 outline-none"
              value={reps === 0 ? "" : reps}
              onChange={e => setReps(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            {units.map(u => (
              <button
                type="button"
                key={u}
                className={`px-4 py-2 rounded-xl font-medium text-xl ${unit === u ? "bg-[#ececf2] text-[#353942]" : "bg-transparent text-[#353942]"}`}
                onClick={() => setUnit(u)}
              >
                {u}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 text-xl">
            <span className="text-[#353942]">Weight</span>
            <input
              type="text"
              className="bg-transparent text-right w-12 outline-none"
              value={weight === 0 ? "" : weight}
              onChange={e => setWeight(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </form>
      </div>
    </div>
  );
} 