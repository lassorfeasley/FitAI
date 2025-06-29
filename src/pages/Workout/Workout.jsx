// @https://www.figma.com/design/Fg0Jeq5kdncLRU9GnkZx7S/SwiperFit?node-id=49-317

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabaseClient";
import { useActiveWorkout } from "@/contexts/ActiveWorkoutContext";
import CardWrapper from "@/components/common/Cards/Wrappers/CardWrapper";
import DeckWrapper from "@/components/common/Cards/Wrappers/DeckWrapper";
import AppLayout from "@/components/layout/AppLayout";
import ProgramCard from "@/components/common/Cards/ProgramCard";

const Workout = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { startWorkout } = useActiveWorkout();

  // Add debug logging
  useEffect(() => {
    console.log("Auth state:", { user, session });
  }, [user, session]);

  // Fetch programs and their exercises on mount
  useEffect(() => {
    async function fetchPrograms() {
      if (!user) {
        console.log("No user found, skipping fetch");
        return;
      }
      console.log("Fetching programs for user:", user.id);
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("programs")
          .select(
            `
            id,
            program_name,
            program_exercises (
              id,
              exercise_id,
              exercises ( name ),
              program_sets (
                id,
                reps,
                weight,
                weight_unit,
                set_variant
              )
            )
          `
          )
          .eq("user_id", user.id)
          .neq("is_archived", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching programs:", error);
          setPrograms([]);
        } else {
          console.log("Successfully fetched programs:", data);
          const programsWithExercises = (data || []).map((program) => {
            const exerciseCount = (program.program_exercises || []).length;
            const setCount = (program.program_exercises || []).reduce(
              (total, pe) => total + (pe.program_sets ? pe.program_sets.length : 0),
              0
            );
            return {
              ...program,
              exerciseCount,
              setCount,
              exerciseNames: (program.program_exercises || [])
                .map((pe) => pe.exercises?.name)
                .filter(Boolean),
            };
          });
          setPrograms(programsWithExercises);
        }
      } catch (err) {
        console.error("Exception fetching programs:", err);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, [user]);

  const handleStartWorkout = async (program) => {
    try {
      await startWorkout(program);
      navigate("/workout/active");
    } catch (error) {
      console.error(error.message);
      // Optionally, show an error message to the user
      alert(error.message);
    }
  };

  // Filter programs by search
  const filteredPrograms = programs.filter((program) => {
    const q = search.toLowerCase();
    return (
      program.program_name?.toLowerCase().includes(q) ||
      (program.exerciseNames &&
        program.exerciseNames.some((name) => name.toLowerCase().includes(q)))
    );
  });

  return (
    <AppLayout
      appHeaderTitle="Start Workout"
      showAddButton={false}
      showBackButton={false}
      search={true}
      searchPlaceholder="Search programs or exercises"
      searchValue={search}
      onSearchChange={setSearch}
      pageContext="workout"
    >
      <DeckWrapper paddingX={20}>
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No programs found. Create a program to start a workout.
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <CardWrapper key={program.id} gap={0} marginTop={0} marginBottom={0}>
              <ProgramCard
                id={program.id}
                name={program.program_name}
                exerciseCount={program.exerciseCount}
                setCount={program.setCount}
                leftText="Swipe to begin"
                rightText={""}
                swipeStatus="active"
                onSwipeComplete={() => handleStartWorkout(program)}
              />
            </CardWrapper>
          ))
        )}
      </DeckWrapper>
    </AppLayout>
  );
};

export default Workout;
