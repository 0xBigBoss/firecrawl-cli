#!/usr/bin/env node
import Pastel from "pastel";
import { z } from "zod";
import ScrapeCommand from "./commands/scrape";
import CrawlCommand from "./commands/crawl";
import MapCommand from "./commands/map";
import DefaultCommand from "./commands/index";

const app = new Pastel({
  name: "fcrawl",
  version: "1.1.0",
  description: "Web crawler and scraper using Firecrawl API",
});

// Register commands manually since import.meta doesn't work in compiled executables
app.command("scrape", "Scrape one or more URLs", ScrapeCommand);
app.command("crawl", "Crawl a website starting from URL", CrawlCommand);
app.command("map", "Discover all URLs on a website", MapCommand);

// Default command for legacy support
app.setDefaultCommand(DefaultCommand);

await app.run();