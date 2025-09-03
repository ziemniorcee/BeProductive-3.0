export function buildMyDay(raw, { today, projectQueue, deadlines }) {
    const [todayGoals, other] = raw.reduce(
        ([g1, g2], it) => {
            if ([2,3].includes(it.dateType)) g1.push(it);
            else if ([0,1].includes(it.dateType) && it.addDate === today) g1.unshift({ ...it, addDate: today });
            else g2.push(it);
            return [g1, g2];
        },
        [[], []]
    );

    const projects = other.filter(i => i.dateType === 0);
    const dls = other.filter(i => i.dateType === 1);

    const remaining = Math.max(0, 10 - todayGoals.length);
    const pMax = Math.round(remaining * 0.5); // or compute from settings
    const dMax = remaining - pMax;

    const pick = (arr, n) => arr.slice(0, Math.max(0, n));
    const imported =
        projects.length < pMax
            ? [...projects, ...pick(dls, remaining - projects.length)]
            : dls.length < dMax
                ? [...pick(projects, remaining - dls.length), ...dls]
                : [...pick(projects, pMax), ...pick(dls, dMax)];

    todayGoals.sort((a,b) => {
        if (a.dateType === 2 && b.dateType !== 2) return -1;
        if (b.dateType === 2 && a.dateType !== 2) return 1;
        if (a.dateType === 3 && b.dateType !== 3) return 1;
        if (b.dateType === 3 && a.dateType !== 3) return -1;
        if (a.importance !== b.importance) return b.importance - a.importance;
        return b.dateType - a.dateType;
    });
    return [...todayGoals, ...imported];
}
