import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [MenubarModule],
    templateUrl: './navbar.component.html',
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
            },
            {
                label: 'Contact',
                routerLink: 'contact',
                icon: 'pi pi-fw pi-calendar'
            }
        ];
    }

}
