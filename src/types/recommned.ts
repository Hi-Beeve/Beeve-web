export type RecommendResponseData = {
"workout_plan": [
      {
        "day": string,
        "focus": string,
        "warm_up": string,
        "cool_down": string,
        "exercises": [
          {
            "name": string,
            "sets": string,
            "reps": string,
            "rest_seconds": string,
            "rpe": string
          }
        ]
      }
    ],
    "notes": string
}

export type RecommendRequestData = {
     "gender": string, // F/M
  "age": number,
  "contraindications": string,
  "measurePlace": string,
  "purpose": string; // TODO : 현재 GENERAL_FITNESS로 고정
}
