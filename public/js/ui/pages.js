// Pages beyond the core workspace. A page appears in the menu only once it exists here,
// so the public link never shows a dead link.
import { About } from "./about.js";
import { TestBench } from "./tests.js";

export const PAGES = { about: About, tests: TestBench };
