// AI-ASSISTANT-POLICY: STYLING LOCKED
// ==========================================
// ATTENTION AI ASSISTANT:
// Do not modify the styling of this component without explicit user instruction.
// This component's visual appearance has been finalized and approved.
// Any general refactoring or styling updates, especially those based on
// external tools like Figma, should NOT alter the CSS classes, inline styles,
// or other style-related code in this file.
//
// Before making any style changes, confirm directly with the user.
// ==========================================
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import SwipeSwitch from "@/components/molecules/swipe-switch";
import SetEditForm from "@/components/common/forms/SetEditForm";
import PropTypes from "prop-types";
import { Maximize2, Minimize2 } from "lucide-react";
import CardWrapper from "@/components/common/Cards/Wrappers/CardWrapper";
import SetBadge from "@/components/molecules/SetBadge";
import { FormHeader } from "@/components/atoms/sheet";
import SwiperForm from "@/components/molecules/swiper-form";
import FormSectionWrapper from "../forms/wrappers/FormSectionWrapper";
import ToggleInput from "@/components/molecules/toggle-input";
import { SwiperButton } from "@/components/molecules/swiper-button";
import { TextInput } from "@/components/molecules/text-input";

const ActiveExerciseCard = ({
  exerciseId,
  exerciseName,
  initialSetConfigs = [],
  onSetComplete,
  onSetDataChange,
  onExerciseComplete,
  isUnscheduled,
  default_view = true,
  setData = [],
  onSetProgrammaticUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(
    !default_view && initialSetConfigs.length > 1
  );
  const [openSetIndex, setOpenSetIndex] = useState(null);
  const [editForm, setEditForm] = useState({ reps: 0, weight: 0, unit: "lbs" });
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [addType, setAddType] = useState("today");
  const mountedRef = useRef(true);
  const setsRef = useRef([]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Derive sets from setData and initialSetConfigs
  const sets = useMemo(() => {
    const combined = initialSetConfigs.map((config, i) => {
      const fromParent =
        setData.find((d) => d.program_set_id === config.id) || {};

      const id = fromParent.id || config.id;
      const tempId = `temp-${i}`;

      return {
        ...config,
        ...fromParent,
        id: id || tempId,
        tempId: id ? null : tempId,
        reps: fromParent.reps ?? config.reps,
        weight: fromParent.weight ?? config.weight,
        weight_unit:
          fromParent.weight_unit ??
          fromParent.unit ??
          config.weight_unit ??
          "lbs",
        status: fromParent.status
          ? fromParent.status
          : i === 0
          ? config.set_type === "timed" || fromParent.set_type === "timed"
            ? "ready-timed-set"
            : "active"
          : "locked",
        set_variant:
          fromParent.set_variant || config.set_variant || `Set ${i + 1}`,
        program_set_id: config.id,
      };
    });

    // Ensure the correct active/locked statuses after merging
    let pendingFound = false;
    const adjusted = combined.map((set) => {
      if (set.status === "complete") {
        return set;
      }
      if (!pendingFound) {
        pendingFound = true;
        return {
          ...set,
          status:
            set.set_type === "timed" ? "ready-timed-set" : "active",
        };
      }
      return { ...set, status: "locked" };
    });
    return adjusted;
  }, [initialSetConfigs, setData]);

  useEffect(() => {
    setsRef.current = sets;
  }, [sets]);

  const allComplete = useMemo(
    () => sets.every((set) => set.status === "complete"),
    [sets]
  );
  const anyActive = useMemo(
    () =>
      sets.some(
        (set) => set.status === "active" || set.status === "ready-timed-set"
      ),
    [sets]
  );
  const activeSet = useMemo(() => {
    const active = sets.find(
      (set) => set.status === "active" || set.status === "ready-timed-set"
    );
    if (active) return active;

    const firstLocked = sets.find((set) => set.status === "locked");
    if (firstLocked) return firstLocked;

    return sets.length > 0 ? sets[0] : undefined;
  }, [sets]);
  const swipeStatus = useMemo(
    () => (allComplete ? "complete" : anyActive ? "active" : "locked"),
    [allComplete, anyActive]
  );

  // Notify parent once when exercise becomes fully complete
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (allComplete && !notifiedRef.current) {
      notifiedRef.current = true;
      onExerciseComplete?.(exerciseId);
    }
    if (!allComplete && notifiedRef.current) {
      // Allow re-notification if sets are undone
      notifiedRef.current = false;
    }
  }, [allComplete, exerciseId, onExerciseComplete]);

  const handleSetComplete = useCallback(
    async (setIdx) => {
      if (!mountedRef.current) return;

      const setToComplete = { ...sets[setIdx] };
      const nextSet = sets[setIdx + 1];

      // First, call onSetComplete for analytics if it exists.
      if (onSetComplete) {
        // For a timed set starting, we don't mark it complete yet.
        // For all others, we do.
        if (
          setToComplete.set_type !== "timed" ||
          setToComplete.status !== "ready-timed-set"
        ) {
          Promise.resolve(
            onSetComplete(exerciseId, { ...setToComplete, status: "complete" })
          ).catch(console.error);
        }
      }

      if (!onSetDataChange) return;

      const updates = [];
      if (setToComplete.set_type === "timed") {
        if (setToComplete.status === "ready-timed-set") {
          // Transition to counting down
          updates.push({
            id: setToComplete.id,
            changes: { status: "counting-down-timed" },
          });
        } else if (setToComplete.status === "counting-down-timed") {
          // Timer finished, mark as complete and persist set_type and timed_set_duration
          updates.push({
            id: setToComplete.id,
            changes: {
              status: "complete",
              set_type: setToComplete.set_type,
              timed_set_duration: setToComplete.timed_set_duration,
              set_variant: setToComplete.set_variant,
            },
          });
          if (nextSet && nextSet.status === "locked") {
            const nextStatus =
              nextSet.set_type === "timed" ? "ready-timed-set" : "active";
            const { tempId, ...restOfNextSet } = nextSet;
            updates.push({
              id: nextSet.id,
              changes: { ...restOfNextSet, status: nextStatus },
            });
          }
        }
      } else {
        // For regular sets, just mark as complete
        updates.push({
          id: setToComplete.id,
          changes: {
            status: "complete",
            set_variant: setToComplete.set_variant,
            program_set_id: setToComplete.program_set_id,
          },
        });
        if (nextSet && nextSet.status === "locked") {
          const nextStatus =
            nextSet.set_type === "timed" ? "ready-timed-set" : "active";
          const { tempId, ...restOfNextSet } = nextSet;
          updates.push({
            id: nextSet.id,
            changes: { ...restOfNextSet, status: nextStatus },
          });
        }
      }

      // Log local set completion for clarity
      if (setToComplete.status !== "counting-down-timed") {
        console.log(
          `${setToComplete.set_variant} of ${exerciseName} logged to local.`
        );
      }

      if (updates.length > 0) {
        Promise.resolve(onSetDataChange(exerciseId, updates)).catch(
          console.error
        );
      }
    },
    [exerciseId, onSetComplete, onSetDataChange, sets]
  );

  const handleActiveSetComplete = useCallback(async () => {
    if (!mountedRef.current) return;

    // Collect all sets that are not complete
    const incompleteSets = sets.filter((s) => s.status !== "complete");
    if (incompleteSets.length === 0) return;

    // Prepare batch updates
    const updates = incompleteSets.map((set) => ({
      id: set.id,
      changes: {
        status: "complete",
        program_set_id: set.program_set_id,
        set_variant: set.set_variant,
      },
    }));

    // Call analytics for each set
    if (onSetComplete) {
      incompleteSets.forEach((set) => {
        onSetComplete(exerciseId, { ...set, status: "complete" });
      });
    }

    // Batch update all sets
    if (onSetDataChange) {
      onSetDataChange(exerciseId, updates);
    }
  }, [exerciseId, onSetComplete, onSetDataChange, sets]);

  const handlePillClick = useCallback(
    (idx) => {
      if (!mountedRef.current) return;
      const set = sets[idx];
      setEditForm({
        reps: set.reps,
        weight: set.weight,
        unit: set.weight_unit,
        set_type: set.set_type || initialSetConfigs[idx]?.set_type || "reps",
        timed_set_duration:
          set.timed_set_duration ||
          initialSetConfigs[idx]?.timed_set_duration ||
          30,
        set_variant: set.set_variant || set.name,
      });
      setOpenSetIndex(idx);
      setIsEditSheetOpen(true);
    },
    [sets, initialSetConfigs]
  );

  const handleEditFormSave = useCallback(
    async (formValues) => {
      if (!mountedRef.current || openSetIndex === null) return;

      const set_to_update = sets[openSetIndex];
      const set_id_to_update = set_to_update.id;
      // Derive new status based on set_type and current state
      let newStatus = set_to_update.status;
      if (formValues.completed) {
        newStatus = "complete";
      } else {
        // Switching to timed: move to ready-timed-set if not complete
        if (
          formValues.set_type === "timed" &&
          ["active", "locked"].includes(set_to_update.status)
        ) {
          newStatus = "ready-timed-set";
        }
        // Switching from timed to reps: reset counting/ready states back to active
        if (
          formValues.set_type !== "timed" &&
          ["ready-timed-set", "counting-down-timed"].includes(
            set_to_update.status
          )
        ) {
          newStatus = "active";
        }
      }
      const set_variant_to_save =
        formValues.set_variant || set_to_update.set_variant;

      const updates = [
        {
          id: set_id_to_update,
          changes: {
            reps: formValues.reps,
            weight: formValues.weight,
            weight_unit: formValues.unit,
            set_variant: set_variant_to_save,
            set_type: formValues.set_type,
            timed_set_duration:
              formValues.set_type === "timed"
                ? formValues.timed_set_duration
                : undefined,
            ...(newStatus !== set_to_update.status
              ? { status: newStatus }
              : {}),
            program_set_id: set_to_update.program_set_id,
          },
        },
      ];

      if (onSetDataChange) {
        Promise.resolve(onSetDataChange(exerciseId, updates)).catch(
          console.error
        );
      }

      setOpenSetIndex(null);
      setIsEditSheetOpen(false);
      setFormDirty(true);
    },
    [exerciseId, onSetDataChange, openSetIndex, sets, editForm]
  );

  const handleEditFormSaveForFuture = useCallback(
    async (formValues) => {
      if (!mountedRef.current || openSetIndex === null) return;

      // First, save the changes for today
      handleEditFormSave(formValues);

      // Then, call the programmatic update function if it exists
      if (onSetProgrammaticUpdate) {
        const set_to_update = sets[openSetIndex];
        onSetProgrammaticUpdate(
          exerciseId,
          set_to_update.program_set_id,
          formValues
        );
      }
    },
    [
      exerciseId,
      openSetIndex,
      sets,
      handleEditFormSave,
      onSetProgrammaticUpdate,
    ]
  );

  const handleSetDelete = useCallback(async () => {
    if (!mountedRef.current || openSetIndex === null) return;

    const set_to_delete = sets[openSetIndex];
    const set_id_to_delete = set_to_delete.id;

    const updates = [
      {
        id: set_id_to_delete,
        changes: {
          status: "deleted",
          program_set_id: null,
          set_variant: null,
        },
      },
    ];

    if (onSetDataChange) {
      onSetDataChange(exerciseId, updates);
    }

    setOpenSetIndex(null);
    setIsEditSheetOpen(false);
    setFormDirty(true);
  }, [exerciseId, onSetDataChange, openSetIndex, sets]);

  return (
    <>
      {isExpanded && initialSetConfigs.length > 1 ? (
        <CardWrapper
          className="Property1Expanded self-stretch bg-white rounded-xl flex flex-col justify-start items-stretch gap-0"
          style={{ maxWidth: 500 }}
          gap={0}
          marginTop={0}
          marginBottom={0}
        >
          <div className="Labelandexpand self-stretch p-3 inline-flex justify-start items-start overflow-hidden">
            <div className="Label flex-1 inline-flex flex-col justify-start items-start">
              <div className="Workoutname self-stretch justify-start text-slate-600 text-heading-md">
                {exerciseName}
              </div>
              <div className="Setnumber self-stretch justify-start text-slate-600 text-sm font-normal leading-tight">
                {sets.length === 1
                  ? "One set"
                  : sets.length === 2
                  ? "Two sets"
                  : sets.length === 3
                  ? "Three sets"
                  : `${sets.length} sets`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="SortDescending size-7 relative overflow-hidden"
            >
              <Minimize2 className="w-6 h-5 left-[3px] top-[4.50px] absolute text-neutral-400" />
            </button>
          </div>
          <div className="self-stretch h-0 border-b border-stone-200" />
          {sets.map((set, idx) => {
            const setType = set.set_type || "reps";
            const timedDuration = set.timed_set_duration;
            const isLastSet = idx === sets.length - 1;
            return (
              <div
                key={`${set.program_set_id ?? set.tempId ?? `idx-${idx}`}`}
                className={`SetsLog self-stretch p-3 bg-white flex flex-col justify-start items-start gap-2 ${
                  !isLastSet ? "border-b border-stone-200" : ""
                }`}
              >
                <div className="Setrepsweightwrapper self-stretch inline-flex justify-between items-center">
                  <div className="SetOne justify-center text-slate-600 text-sm font-normal leading-tight">
                    {set.set_variant || set.name}
                  </div>
                  <SetBadge
                    key={`badge-${set.program_set_id ?? set.tempId ?? idx}`}
                    reps={set.reps}
                    weight={set.weight}
                    unit={set.weight_unit}
                    complete={set.status === "complete"}
                    editable={true}
                    onEdit={() => handlePillClick(idx)}
                    set_type={setType}
                    timed_set_duration={timedDuration}
                  />
                </div>
                <div className="Swipeswitch self-stretch bg-neutral-300 rounded-sm flex flex-col justify-start items-start">
                  <SwipeSwitch
                    status={set.status}
                    onComplete={() => handleSetComplete(idx)}
                    duration={timedDuration || 30}
                  />
                </div>
              </div>
            );
          })}
          {isUnscheduled && (
            <div className="text-center text-sm text-gray-500 mt-2 p-3 bg-white w-full">
              Unscheduled Exercise
            </div>
          )}
        </CardWrapper>
      ) : (
        // Compact view
        <CardWrapper
          className="Property1Compact self-stretch p-3 bg-white rounded-xl inline-flex flex-col justify-start items-start gap-4"
          style={{ maxWidth: 500 }}
          gap={0}
          marginTop={0}
          marginBottom={0}
        >
          <div className="Labelandexpand self-stretch inline-flex justify-start items-start overflow-hidden">
            <div className="Label flex-1 inline-flex flex-col justify-start items-start">
              <div className="Workoutname self-stretch justify-start text-slate-600 text-heading-md">
                {exerciseName}
              </div>
              <div className="Setnumber self-stretch justify-start text-slate-600 text-sm font-normal leading-tight">
                {sets.length === 1
                  ? "One set"
                  : sets.length === 2
                  ? "Two sets"
                  : sets.length === 3
                  ? "Three sets"
                  : `${sets.length} sets`}
              </div>
            </div>
            {initialSetConfigs.length > 1 && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="SortDescending size-7 relative overflow-hidden"
              >
                <Maximize2 className="w-6 h-5 left-[3px] top-[4.50px] absolute text-neutral-400" />
              </button>
            )}
          </div>
          {activeSet && (
            <SwipeSwitch
              status={activeSet.status}
              onComplete={handleActiveSetComplete}
              duration={
                activeSet.set_type === "timed"
                  ? activeSet.timed_set_duration
                  : undefined
              }
            />
          )}
          <div className="self-stretch inline-flex justify-start items-center gap-3 flex-wrap content-center">
            {sets.map((set, idx) => {
              const setType = set.set_type || "reps";
              const timedDuration = set.timed_set_duration;
              return (
                <SetBadge
                  key={`${set.program_set_id ?? set.tempId ?? idx}`}
                  set={set}
                  onClick={() => handlePillClick(idx)}
                  onEdit={() => handlePillClick(idx)}
                  reps={set.reps}
                  weight={set.weight}
                  unit={set.weight_unit}
                  complete={set.status === "complete"}
                  editable={true}
                  set_type={setType}
                  timed_set_duration={timedDuration}
                />
              );
            })}
          </div>
          {isUnscheduled && (
            <div className="text-center text-sm text-gray-500 mt-2">
              Unscheduled Exercise
            </div>
          )}
        </CardWrapper>
      )}

      {isEditSheetOpen && (
        <SwiperForm
          open={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          title="Edit"
          leftAction={() => setIsEditSheetOpen(false)}
          rightAction={() => handleEditFormSave(editForm)}
          rightEnabled={formDirty}
          rightText="Save"
          leftText="Cancel"
        >
          {/* Set name */}
          <SwiperForm.Section>
            <TextInput
              label="Set name"
              optional
              value={editForm.set_variant || ""}
              onChange={(e) => {
                const val = e.target.value;
                setEditForm((prev) => ({ ...prev, set_variant: val }));
                setFormDirty(true);
              }}
            />
          </SwiperForm.Section>

          {/* Main editing fields without name */}
          <SwiperForm.Section>
            <SetEditForm
              isChildForm
              showSetNameField={false}
              onValuesChange={setEditForm}
              onDirtyChange={setFormDirty}
              initialValues={editForm}
            />
          </SwiperForm.Section>

          {/* Add to program toggle */}
          {onSetProgrammaticUpdate && (
            <SwiperForm.Section>
              <ToggleInput
                label="Add to program?"
                options={[
                  { label: "Just for today", value: "today" },
                  { label: "Permanently", value: "future" },
                ]}
                value={addType}
                onChange={(val) => val && setAddType(val)}
              />
            </SwiperForm.Section>
          )}

          {/* Delete button */}
          <SwiperForm.Section bordered={false}>
            <SwiperButton
              onClick={handleSetDelete}
              variant="destructive"
              className="w-full"
            >
              Delete Set
            </SwiperButton>
          </SwiperForm.Section>
        </SwiperForm>
      )}
    </>
  );
};

ActiveExerciseCard.propTypes = {
  exerciseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  exerciseName: PropTypes.string.isRequired,
  initialSetConfigs: PropTypes.arrayOf(
    PropTypes.shape({
      reps: PropTypes.number,
      weight: PropTypes.number,
      unit: PropTypes.string,
      isComplete: PropTypes.bool,
    })
  ),
  onSetComplete: PropTypes.func,
  onSetDataChange: PropTypes.func,
  onExerciseComplete: PropTypes.func,
  isUnscheduled: PropTypes.bool,
  default_view: PropTypes.bool,
  setData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      reps: PropTypes.number,
      weight: PropTypes.number,
      weight_unit: PropTypes.string,
      status: PropTypes.oneOf([
        "active",
        "locked",
        "complete",
        "counting-down",
        "ready-timed-set",
        "counting-down-timed",
      ]),
      unit: PropTypes.string,
    })
  ),
  onSetProgrammaticUpdate: PropTypes.func,
};

export default React.memo(ActiveExerciseCard);
