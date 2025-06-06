// @https://www.figma.com/design/Fg0Jeq5kdncLRU9GnkZx7S/FitAI?node-id=48-601&t=YBjXtsLhxGedobad-4

import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import { PageNameContext } from "../../App";
import TileWrapper from "../../components/common/CardsAndTiles/Tiles/TileWrapper";
import ProgramTile from "../../components/common/CardsAndTiles/Tiles/ProgramTile";

const ProgramsIndex = () => {
  const { setPageName } = useContext(PageNameContext);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setPageName("Programs");
    async function fetchPrograms() {
      setLoading(true);
      // Fetch all programs
      const { data: programsData, error } = await supabase
        .from("programs")
        .select("id, program_name, created_at")
        .order("created_at", { ascending: false });
      if (error) {
        setPrograms([]);
        setLoading(false);
        return;
      }
      // For each program, fetch the number of exercises
      const programsWithCounts = await Promise.all(
        (programsData || []).map(async (program) => {
          const { count, error: countError } = await supabase
            .from("program_exercises")
            .select("id", { count: "exact", head: true })
            .eq("program_id", program.id);
          return {
            ...program,
            exerciseCount: countError ? 0 : count,
            editable: true, // You can add logic for editability if needed
          };
        })
      );
      setPrograms(programsWithCounts);
      setLoading(false);
    }
    fetchPrograms();
  }, [setPageName]);

  return (
    <div className="flex flex-col h-screen">
      <AppHeader
        appHeaderTitle="Programs"
        actionBarText="Create new program"
        showActionBar={true}
        showActionIcon={true}
        showBackButton={false}
        subhead={false}
        search={true}
        searchPlaceholder="Search programs"
        onAction={() => navigate("/create_new_program")}
        data-component="AppHeader"
      />
      <TileWrapper className="px-4">
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        ) : programs.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No programs found.
          </div>
        ) : (
          programs.map((program) => (
            <ProgramTile
              key={program.id}
              programName={program.program_name}
              exerciseCount={program.exerciseCount}
              onClick={() => navigate(`/programs/${program.id}/configure`)}
            />
          ))
        )}
      </TileWrapper>
    </div>
  );
};

export default ProgramsIndex;
