# 🧹 Cleaning Duty Roulette

A minimal web app for **BA 3101** that replaces the manual process of spinning a wheel, checking who already cleaned, and manually announcing selected students in the GC.

## The Idea

Randomly select 5 students, prevent recently selected students from being picked again, track the rotation, and generate the GC announcement automatically.

The app is meant to feel like a small utility — not a game or a complicated management system.

---

## 1. The Problem

Currently, the process looks like this:

```
Class needs cleaners
       ↓
Open random wheel
       ↓
Add 34 students
       ↓
Spin 5 times
       ↓
Remember who was already selected
       ↓
Manually announce in GC
       ↓
Next cleaning day
       ↓
Repeat
```

Problems with this process:

- Someone has to manually maintain the list
- Recently selected students can accidentally be selected again
- It's difficult to remember who already cleaned
- There's no proper history
- The GC announcement has to be typed manually
- Resetting the rotation can cause unfair repetition

This app automates all of the above.

---

## 2. Main Concept

The system maintains a cleaning rotation of **34 students**, selecting **5 students per round**.

Once selected, those students become unavailable for subsequent rounds in the current cycle:

```
ROUND 1 → 5 selected → 29 available
ROUND 2 → 5 selected → 24 available
ROUND 3 → 5 selected → 19 available
...
```

The app always knows who has already been assigned.

---

## 3. The Reset Rule

With 34 students and 5 per round, a full cycle looks like:

```
5 + 5 + 5 + 5 + 5 + 5 + 4 = 34
```

The final round contains **4 students**.

When a cycle finishes and resets, the students from the **final round of the previous cycle are excluded from the first round of the next cycle** — this prevents them from immediately cleaning again.

**Example:**

```
Cycle 1 — Final Round
01 Francis
02 Allyza
03 Jhon
04 Chaeron

Cycle 2 starts with:
34 students
     ↓
Exclude: Francis, Allyza, Jhon, Chaeron
     ↓
30 eligible students
     ↓
Randomly select 5
```

---

## 4. Main UI

The UI is minimal, clean, and focused. No dashboards, giant cards, unnecessary statistics, excessive animations, or literal roulette wheels.

The primary screen answers one question: **Who is cleaning today?**

```
┌──────────────────────────────────────────────────┐
│ CLEANING DUTY                              ⋯     │
│ BA 3101                                          │
│                                                   │
│ Today                                            │
│ September 7, 2026                                │
│                                                   │
│                    [ SPIN ]                      │
│                                                   │
│ TODAY'S CLEANERS                                 │
│                                                   │
│  01   Francis Gil B. Abarintos                   │
│  02   Allyza A. Aclan                            │
│  03   Jhon Lester T. Adalia                      │
│  04   Chaeron Jade C. Aldovino                   │
│  05   Alvin Aloya                                │
│                                                   │
│             [ Copy Announcement ]                │
│                                                   │
│                    Round 4                       │
│                  20 / 34                         │
└──────────────────────────────────────────────────┘
```

---

## 5. The "Roulette"

No literal roulette wheel. Instead, student names rapidly cycle when the user presses **Spin**, then settle on the final 5 selections — giving the feeling of a random draw while keeping the UI clean.

```
SELECTING...
Francis Gil
Jhon Lester
Student 24
Allyza Aclan
Student 17
Chaeron Jade
```

---

## 6. Spin Behavior

1. User clicks **[ SPIN ]**
2. Button changes to **[ SELECTING... ]**
3. Names animate briefly
4. 5 students are selected and revealed one by one
5. Once all five appear, **[ Copy Announcement ]** becomes available

---

## 7. GC Announcement

After selection, clicking **[ Copy Announcement ]** generates:

```
BA 3101 — Cleaning Duty

Today's assigned cleaners:

Francis Gil
Allyza A.
Jhon Lester
Chaeron Jade
Alvin

Please complete your assigned cleaning duty.
```

The button then changes to **✓ Copied**, and the user pastes it directly into Messenger. No direct Messenger integration needed.

---

## 8. Navigation

Kept intentionally tiny:

```
CLEANING DUTY                    ⋯
```

Menu items:

- History
- Students
- Settings

No Dashboard, Analytics, Reports, Notifications, or Profile — these would just make a simple app feel bloated.

---

## 9. History Page

A simple chronological list of previous cleaning rounds. No charts, graphs, or comparative statistics.

```
HISTORY

Round 4 — September 7
01  Francis Gil
02  Allyza A.
03  Jhon Lester
04  Chaeron Jade
05  Alvin

Round 3 — September 4
01  Student
02  Student
...
```

---

## 10. Students Page

A simple class roster with an availability status per student:

```
STUDENTS
34 students

01   Francis Gil B. Abarintos       ● Recently cleaned
02   Allyza A. Aclan                ● Recently cleaned
03   Jhon Lester T. Adalia          ○ Available
```

---

## 11. Rotation Indicator

Displayed at the bottom of the main screen:

```
Round 4 · 20 / 34 students
```

Progression example:

| Round | Progress |
| ----- | -------- |
| 1     | 5 / 34   |
| 2     | 10 / 34  |
| 3     | 15 / 34  |
| 4     | 20 / 34  |
| 5     | 25 / 34  |
| 6     | 30 / 34  |
| 7     | 34 / 34  |

When it reaches `34 / 34`, the rotation is complete.

---

## 12. New Rotation

```
ROTATION COMPLETE

All 34 students have been assigned.
The next rotation will exclude
the final group from this rotation.

[ Start New Rotation ]
```

After clicking:

```
NEW ROTATION
30 students available
[ START ROUND ]
```

The previous final group is temporarily excluded.

---

## 13. Selection Algorithm

The core logic behind the app:

```
students = 34
available = 34
selected = []
history = []

When selecting:
1. Get available students.
2. Randomize them.
3. Select 5.
4. Remove those 5 from available.
5. Save the round.
6. Display the results.
```

Repeats until all 34 students have been assigned.

---

## 14. Fairness Algorithm (Future Enhancement)

Instead of pure random selection, a smarter version can:

1. Remove students who recently cleaned
2. Check cleaning counts
3. Prioritize students with fewer assignments
4. Randomize among equally eligible students
5. Select 5

This prevents any one student from being disproportionately selected across multiple cycles.

---

## 15. Database Schema

Suggested schema (Supabase / PostgreSQL):

```
students
  id
  name
  active
  created_at

cycles
  id
  started_at
  completed_at
  status

rounds
  id
  cycle_id
  round_number
  created_at

assignments
  id
  round_id
  student_id
```

---

## 16. Tech Stack

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
- **PostgreSQL**
- CSS animations for the name-selection effect (no animation library required)

---

## 17. Roadmap

### MVP

```
┌───────────────────────┐
│   CLEANING DUTY       │
│       [ SPIN ]        │
│   Today's Cleaners    │
│   01–05 Student       │
│ [ Copy Announcement ] │
│ Round 4 · 20 / 34     │
└───────────────────────┘
```

### V1

- Student list
- Random selection
- 5 students per round
- Recently-cleaned exclusion
- Round tracking
- Copy announcement

### V2

- History
- Cycle/reset system
- Final-round exclusion
- Supabase persistence
- Student management

### V3

- Fairness algorithm
- Admin controls
- Undo selection
- Multiple classes
- Multiple duty types

---

## 18. Project Structure

```
CLEANING DUTY
│
├── Main
│   ├── Today's date
│   ├── Spin
│   ├── Selected 5 students
│   ├── Copy announcement
│   └── Rotation progress
│
├── History
│   └── Previous rounds
│
├── Students
│   └── 34-person roster
│
└── Settings
    ├── Class name
    ├── Students per round
    └── Reset rotation
```

---

## Summary

```
OPEN APP → PRESS SPIN → 5 STUDENTS → COPY → PASTE TO GC → DONE
```

The algorithm handles fairness in the background — the UI stays simple.
