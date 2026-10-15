import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Introduces the fan project, links to results and standings, and controls the hero video.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section
      class="hero"
      aria-labelledby="home-title">
      <video
        #video
        autoplay
        loop
        muted
        playsinline
        preload="metadata"
        class="background-video"
        aria-hidden="true">
        <source
          src="assets/Home page video.mp4"
          type="video/mp4" />
      </video>
      <div class="content">
        <p class="eyebrow">THE GRID. THE RACES. THE HISTORY.</p>
        <h1 id="home-title">Formula 1</h1>
        <p class="intro">
          Every race tells a story. Explore the results, follow the drivers and
          revisit the seasons that made history.
        </p>
        <div class="actions">
          <a
            class="button primary"
            routerLink="/results">
            Explore race results →
          </a>
          <a
            class="button secondary"
            routerLink="/winners">
            View driver standings
          </a>
        </div>
      </div>
      <button
        class="video-control"
        (click)="video.paused ? video.play() : video.pause()"
        [attr.aria-label]="
          video.paused ? 'Play background video' : 'Pause background video'
        ">
        {{ video.paused ? 'Play video' : 'Pause video' }}
      </button>
    </section>
    <section
      class="explore"
      aria-labelledby="explore-title">
      <p class="eyebrow">YOUR FORMULA 1 COMPANION</p>
      <h2 id="explore-title">Follow a season. Discover a story.</h2>
      <div class="explore-grid">
        <a
          routerLink="/results"
          class="explore-card">
          <span class="number">01 / RACE RESULTS</span>
          <h3>From lights out to the finish.</h3>
          <p>
            Choose a season and round to explore race positions, teams and
            points.
          </p>
          <span class="card-link">Find a Grand Prix →</span>
        </a>
        <a
          routerLink="/winners"
          class="explore-card">
          <span class="number">02 / DRIVER STANDINGS</span>
          <h3>The battle for the championship.</h3>
          <p>
            Meet the podium drivers and compare the field across Formula 1
            seasons.
          </p>
          <span class="card-link">Explore the standings →</span>
        </a>
      </div>
      <p class="guide">
        Start with a season, then select a round on Results. On Winners, see the
        leading three drivers and the rest of the championship table.
      </p>
    </section>
    <footer>
      Independent Formula 1 fan project. Race data provided by
      <a
        href="https://api.jolpi.ca/"
        target="_blank"
        rel="noopener noreferrer">
        Jolpica
      </a>
      . Not affiliated with Formula 1 or the FIA.
    </footer>
  `,
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
