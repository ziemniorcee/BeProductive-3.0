import {normalizeProjects} from "../../domain/projects/normalize";

export class ProjectsStore {
    #projectsRepo; #iconsRepo; #subs = new Set();
    state = { list: [], byId: {}, iconsById: {} };

    constructor({ projectsRepo, iconsRepo }) {
        this.#projectsRepo = projectsRepo;
        this.#iconsRepo = iconsRepo;
    }

    async reload() {
        const [projects, icons] = await Promise.all([
            this.#projectsRepo.goals(),
            this.#iconsRepo.goals(),
        ]);
        this.state = normalizeProjects(projects, icons);
        this.#subs.forEach(f => f(this.state));
    }

    subscribe(f){ this.#subs.add(f); return () => this.#subs.delete(f); }
    get(){ return this.state; }
    getByPublicId(id) {
        if (id == null) return null;
        const map = this.state?.byPublicId ?? {};
        return map[String(id)] ?? null;}

    categoryIdByPublicId(id) {
        if (id == null) return null;
        return this.state?.byPublicId?.[id].categoryPublicId ?? null;
    }

    nameByPublicId(id) {
        const p = this.getByPublicId(id);
        console.log(p)
        return p?.name ?? "No project";
    }

    iconByPublicId(id) {
        const p = this.getByPublicId(id);
        return p?.svgIcon ?? null;
    }
}
