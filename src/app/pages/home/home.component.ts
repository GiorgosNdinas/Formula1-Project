import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `
  <div class="hero">
    <video autoplay loop muted playsinline class="background-video">
      <source src="assets/Home page video.mp4" type="video/mp4">
    </video>
    <div class="content">
      <h1><a href="https://www.formula1.com/" target="_blank">Formula 1</a></h1>
    </div>
  </div>
  `,
  styles: `
    .hero {
      position: relative;
      width: 100%;
      height: 91.7vh;
      overflow: hidden;
    }

    .background-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.7); /* Adjust brightness for better visibility of text */
    }

    .content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .content h1 a {
      font-size: 6vw;
      color: #fff;
      font-weight: 600;
      text-decoration: none;
    }

    .content h1 a:hover {
      color: #ee0000;
      cursor: pointer;
    }

    @media (max-width: 767px) {
      .content {
        width: 90%;
      }
    }
  `
})
export class HomeComponent {
}
