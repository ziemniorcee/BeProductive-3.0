export const PRIORITY = Object.freeze([
    { level: 0, name: "V Priority",  color: "#0075FF" },
    { level: 1, name: "IV Priority", color: "#24FF00" },
    { level: 2, name: "III Priority",color: "#FFFFFF" },
    { level: 3, name: "II Priority", color: "#FFF706" },
    { level: 4, name: "I Priority",  color: "#FF0000" },
]);

export const priorityName  = (lvl) => PRIORITY[lvl]?.name  ?? "Unknown";
export const priorityColor = (lvl) => PRIORITY[lvl]?.color ?? "#FFFFFF";

export const TASK_TYPES = Object.freeze([
    {type: 0, name: "Date", color: "#FFFFFF"},
    {type: 1, name: "Deadline", color: "#FFFFFF"},
    {type: 2, name: "ASAP", color: "#FF0000"},
    {type: 3, name: "Now", color: "#FFFFFF"},
])

export const taskTypeName  = (lvl) => TASK_TYPES[lvl]?.name  ?? "Unknown";
export const taskTypeColor = (lvl) => TASK_TYPES[lvl]?.color ?? "#FFFFFF";