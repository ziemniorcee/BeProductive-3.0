import { AuthService } from "./AuthService";
import {makeCategoriesRepo} from "../../data/categoriesRepo";
import {CategoriesStore} from "../state/CategoriesStore";
import {ProjectsStore} from "../state/ProjectsStore";
import {makeProjectsRepo} from "../../data/projectsRepo";
import {makeIconsRepo} from "../../data/storage/iconsRepo";
import {makeMyDayRepo} from "../../data/myDayRepo";
import {MyDayStore} from "../state/MyDayStore";
import MyDayService from "./MyDayService";

export class AppServices {
    constructor({ http, storage }) {

        this.auth = new AuthService({ http, storage });
        this.categories = new CategoriesStore({ repo: makeCategoriesRepo({ http }) });
        this.projects = new ProjectsStore({
            projectsRepo: makeProjectsRepo({ http }),
            iconsRepo: makeIconsRepo({ http }),
        });

        const mydayRepo = makeMyDayRepo({ http });
        const mydayStore = new MyDayStore({ repo: mydayRepo });
        this.myday = new MyDayService({ store: mydayStore, repo: mydayRepo });

    }
}
