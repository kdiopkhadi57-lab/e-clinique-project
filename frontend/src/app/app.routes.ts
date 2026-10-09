import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'tickets',
    canActivate: [roleGuard(['RECEPTIONNISTE'])],
    loadComponent: () => import('./features/tickets/ticket-list/ticket-list.component').then(m => m.TicketListComponent)
  },
  {
    path: 'tickets/:id',
    canActivate: [roleGuard(['RECEPTIONNISTE'])],
    loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent)
  },
  {
    path: 'patients',
    canActivate: [authGuard],
    loadComponent: () => import('./features/patients/patient-list/patient-list.component').then(m => m.PatientListComponent)
  },
  {
    path: 'patients/nouveau',
    canActivate: [authGuard],
    loadComponent: () => import('./features/patients/patient-form/patient-form.component').then(m => m.PatientFormComponent)
  },
  {
    path: 'patients/:id/modifier',
    canActivate: [authGuard],
    loadComponent: () => import('./features/patients/patient-form/patient-form.component').then(m => m.PatientFormComponent)
  },
  {
    path: 'patients/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/patients/patient-detail/patient-detail.component').then(m => m.PatientDetailComponent)
  },
  {
    path: 'rendezvous',
    canActivate: [authGuard],
    loadComponent: () => import('./features/rendezvous/rdv-list/rdv-list.component').then(m => m.RdvListComponent)
  },
  {
    path: 'rendezvous/calendrier',
    canActivate: [authGuard],
    loadComponent: () => import('./features/rendezvous/rdv-calendrier/rdv-calendrier.component').then(m => m.RdvCalendrierComponent)
  },
  {
    path: 'rendezvous/nouveau/:patientId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/rendezvous/rdv-form/rdv-form.component').then(m => m.RdvFormComponent)
  },
  {
    path: 'rendezvous/nouveau',
    canActivate: [authGuard],
    loadComponent: () => import('./features/rendezvous/rdv-form/rdv-form.component').then(m => m.RdvFormComponent)
  },
  {
    path: 'consultations/nouvelle',
    canActivate: [roleGuard(['ADMIN', 'MEDECIN'])],
    loadComponent: () => import('./features/consultations/consultation-patient-select/consultation-patient-select.component').then(m => m.ConsultationPatientSelectComponent)
  },
  {
    path: 'consultations/nouvelle/:patientId',
    canActivate: [roleGuard(['ADMIN', 'MEDECIN'])],
    loadComponent: () => import('./features/consultations/consultation-form/consultation-form.component').then(m => m.ConsultationFormComponent)
  },
  {
    path: 'consultations',
    canActivate: [authGuard],
    loadComponent: () => import('./features/consultations/consultation-list/consultation-list.component').then(m => m.ConsultationListComponent)
  },
  {
    path: 'consultations/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/consultations/consultation-detail/consultation-detail.component').then(m => m.ConsultationDetailComponent)
  },
  {
    path: 'consultations/:id/ticket',
    canActivate: [authGuard],
    loadComponent: () => import('./features/consultations/consultation-ticket/consultation-ticket.component').then(m => m.ConsultationTicketComponent)
  },
  {
    path: 'factures',
    canActivate: [authGuard],
    loadComponent: () => import('./features/factures/facture-list/facture-list.component').then(m => m.FactureListComponent)
  },
  {
    path: 'factures/nouvelle',
    canActivate: [authGuard],
    loadComponent: () => import('./features/factures/facture-form/facture-form.component').then(m => m.FactureFormComponent)
  },
  {
    path: 'hospitalisations',
    canActivate: [authGuard],
    loadComponent: () => import('./features/hospitalisations/hospitalisation-list/hospitalisation-list.component').then(m => m.HospitalisationListComponent)
  },
  {
    path: 'factures/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/factures/facture-detail/facture-detail.component').then(m => m.FactureDetailComponent)
  },
  {
    path: 'pharmacie',
    canActivate: [roleGuard(['ADMIN', 'PHARMACIEN'])],
    loadComponent: () => import('./features/pharmacie/medicament-list/medicament-list.component').then(m => m.MedicamentListComponent)
  },
  {
    path: 'pharmacie/nouveau',
    canActivate: [roleGuard(['ADMIN', 'PHARMACIEN'])],
    loadComponent: () => import('./features/pharmacie/medicament-form/medicament-form.component').then(m => m.MedicamentFormComponent)
  },
  {
    path: 'pharmacie/:id/modifier',
    canActivate: [roleGuard(['ADMIN', 'PHARMACIEN'])],
    loadComponent: () => import('./features/pharmacie/medicament-form/medicament-form.component').then(m => m.MedicamentFormComponent)
  },
  {
    path: 'pharmacie/mouvements',
    canActivate: [roleGuard(['ADMIN', 'PHARMACIEN'])],
    loadComponent: () => import('./features/pharmacie/stock-mouvements/stock-mouvements.component').then(m => m.StockMouvementsComponent)
  },
  {
    path: 'employes',
    canActivate: [roleGuard(['ADMIN'])],
    loadComponent: () => import('./features/employes/employes.component').then(m => m.EmployesComponent)
  },
  {
    path: 'comptabilite',
    canActivate: [roleGuard(['ADMIN'])],
    loadComponent: () => import('./features/comptabilite/comptabilite.component').then(m => m.ComptabiliteComponent)
  },
  {
    path: 'organismes',
    canActivate: [roleGuard(['ADMIN', 'RECEPTIONNISTE'])],
    loadComponent: () => import('./features/organismes/organismes.component').then(m => m.OrganismesComponent)
  },
  {
    path: 'factures-organismes',
    canActivate: [roleGuard(['ADMIN', 'RECEPTIONNISTE'])],
    loadComponent: () => import('./features/factures-organismes/facture-organisme-list.component').then(m => m.FactureOrganismeListComponent)
  },
  {
    path: 'factures-organismes/:id',
    canActivate: [roleGuard(['ADMIN', 'RECEPTIONNISTE'])],
    loadComponent: () => import('./features/factures-organismes/facture-organisme-detail.component').then(m => m.FactureOrganismeDetailComponent)
  },
  {
    path: 'audit',
    canActivate: [roleGuard(['ADMIN'])],
    loadComponent: () => import('./features/audit/audit-log-list/audit-log-list.component').then(m => m.AuditLogListComponent)
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profil/profil.component').then(m => m.ProfilComponent)
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
