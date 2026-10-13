import { DriverPhotoService } from '../../servicies/driver-photo.service';
import { Component, computed } from '@angular/core';

import { F1ApiService } from '../../servicies/f1-api.service';

import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SeasonSelectorComponent } from '../../components/selector/season-selector.component';
import { TableComponent } from "../../components/table/table.component";

@Component({
 selector: 'app-season-podium', standalone: true, imports: [],
 template: `<div class="podium-container"><div class="podium">
 @for (standing of podium(); track standing.Driver.driverId; let i = $index) {
 <article class="podium-place" [class.first]="i === 0" [class.second]="i === 1" [class.third]="i === 2"><div class="driver-img">
 @if (photos.get(standing.Driver.driverId); as photo) {
  @if (!broken.has(standing.Driver.driverId)) { <img [src]="photo.url" [alt]="standing.Driver.givenName + ' ' + standing.Driver.familyName" width="480" height="480" decoding="async" loading="lazy" (error)="broken.add(standing.Driver.driverId)" /> }
  @else { <div class="initials" role="img" [attr.aria-label]="'Photo unavailable for ' + standing.Driver.givenName + ' ' + standing.Driver.familyName">{{ initials(standing.Driver.givenName, standing.Driver.familyName) }}</div> }
  <p class="photo-credit"><a [href]="photo.sourceUrl" target="_blank" rel="noopener noreferrer">Photo: {{ photo.author }}</a> · <a [href]="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}</a> · Cropped to fit</p>
 } @else { <div class="initials" role="img" [attr.aria-label]="'Photo unavailable for ' + standing.Driver.givenName + ' ' + standing.Driver.familyName">{{ initials(standing.Driver.givenName, standing.Driver.familyName) }}</div><p class="photo-credit">Photo unavailable</p> }
 </div><div class="driver-info"><h2>{{ standing.position }}. {{ standing.Driver.givenName }} {{ standing.Driver.familyName }}</h2><p>{{ standing.Constructors[0].name }}</p><div class="stats"><span>Points: <strong>{{ standing.points }}</strong></span><span>Wins: <strong>{{ standing.wins }}</strong></span></div></div></article>
 }</div></div>`, styleUrl: './podium.component.scss'
})
export class SeasonPodiumComponent {
 readonly broken = new Set<string>();
 readonly podium = computed(() => this.f1ApiService.f1Standings()?.DriverStandings?.slice(0, 3) ?? []);
 constructor(public f1ApiService: F1ApiService, public photos: DriverPhotoService) {}
 initials(givenName: string, familyName: string): string { return givenName.charAt(0) + familyName.charAt(0); }
}


@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [CommonModule, ToolbarModule, ProgressSpinnerModule, TableComponent, SeasonSelectorComponent, SeasonPodiumComponent],
  template: `
    <!-- Toolbar section for displaying F1 winners -->
    <p-toolbar [class.table-container-blur]="this.f1ApiService.winnersAreLoading">
      <!-- Left-aligned group in the toolbar -->
      <div class="p-toolbar-group-start">
        <!-- Heading for the F1 winners section -->
        <h1>F1 winners</h1>
      </div>
      <!-- Right-aligned group in the toolbar -->
      <div class="p-toolbar-group-end">
        <!-- Custom component for selecting the season -->
        <h3 style="font-weight: 500; margin-right: 10px;">Select season:</h3>
        <app-season-selector></app-season-selector>
      </div>
    </p-toolbar>

    @if (this.f1ApiService.winnersError()) { <p class="notice" role="status">{{ this.f1ApiService.winnersError() }}</p> }
    @if (!this.f1ApiService.winnersAreLoading && !this.f1ApiService.winnersError() && !this.f1ApiService.f1Standings()?.DriverStandings?.length) { <p class="notice">No championship standings are available for this season yet.</p> }
    @if (this.f1ApiService.winnersAreLoading) { <p class="notice" role="status">Loading driver standings…</p> }
    @if (this.f1ApiService.f1Standings()?.DriverStandings?.length) {
      <app-season-podium></app-season-podium>
      <app-table tableFor="winners"></app-table>
    }
    `,
  styleUrl: './winners.component.scss'
})
export class WinnersComponent {
  constructor(public f1ApiService: F1ApiService) {
  }
}

