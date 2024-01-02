import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [MenubarModule],
    template: `
        <p-menubar [model]="items" class="menubar-items">
            <ng-template pTemplate="start">
                <a [routerLink]="['/']">
                <img src="assets/F1.png" height="40" class="mr-2" />
                </a>
            </ng-template>
        </p-menubar>
    `,
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    constructor() { }

    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Home',
                routerLink: '/',
                icon: 'pi pi-fw pi-file'
            },
            {
                label: 'Results',
                routerLink: 'results',
                icon: 'pi pi-fw pi-pencil'
            },
            {
                label: 'Winners',
                routerLink: 'winners',
                icon: 'pi pi-fw pi-user'
            }
        ];
    }

}
