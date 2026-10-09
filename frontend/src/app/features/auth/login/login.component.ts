import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TraduirePipe } from '../../../core/i18n/traduire.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TraduirePipe],
  template: `
    <div class="login-wrapper d-flex align-items-center justify-content-center">
      <div class="login-shell shadow">
        <section class="medical-banner" aria-label="Espace médical Cabinet Médical Demba Bodiel SY">
          <img src="assets/login-clinic.png" alt="Accueil du Cabinet Médical Demba Bodiel SY">
          <div class="medical-banner-caption"><i class="bi bi-shield-check"></i><span>{{ 'login.slogan1' | t }}<br>{{ 'login.slogan2' | t }}</span></div>
        </section>

        <section class="login-panel">
          <div class="text-center mb-4">
            <img class="login-logo" src="assets/logo.png" alt="Logo Cabinet Médical Demba Bodiel SY">
            <h3 class="mt-3 mb-1 fw-bold">{{ 'login.bienvenue' | t }}</h3>
            <p class="text-muted mb-0">{{ 'login.connectez' | t }}<br><strong class="brand-name">Cabinet Médical Demba Bodiel SY</strong></p>
          </div>

          <div class="alert alert-danger" *ngIf="erreur">{{ erreur | t }}</div>
          <div class="alert alert-success" *ngIf="messageOubli">{{ messageOubli | t }}</div>

          <form [formGroup]="form" (ngSubmit)="seConnecter()">
            <div class="mb-3">
              <label class="form-label visually-hidden" for="username">{{ 'login.identifiant' | t }}</label>
              <div class="input-with-icon"><i class="bi bi-person"></i><input id="username" type="text" class="form-control" [placeholder]="'login.identifiant' | t" formControlName="username" autocomplete="username"></div>
            </div>
            <div class="mb-3">
              <label class="form-label visually-hidden" for="password">{{ 'login.motDePasse' | t }}</label>
              <div class="input-with-icon"><i class="bi bi-lock"></i><input id="password" type="password" class="form-control" [placeholder]="'login.motDePasse' | t" formControlName="password" autocomplete="current-password"></div>
            </div>
            <div class="login-options"><label><input type="checkbox"> <span>{{ 'login.souvenir' | t }}</span></label><button type="button" (click)="motDePasseOublie()">{{ 'login.oublie' | t }}</button></div>
            <button type="submit" class="btn btn-primary w-100" [disabled]="form.invalid || chargement">
              <span *ngIf="chargement" class="spinner-border spinner-border-sm me-2"></span>
              {{ 'login.seConnecter' | t }}
            </button>
          </form>

          <div class="text-center mt-4 small text-muted">
            {{ 'login.demo' | t }} <strong>admin</strong> / <strong>Admin&#64;123</strong>
          </div>
          <div class="login-footer">© 2024 Cabinet Médical Demba Bodiel SY. {{ 'login.droits' | t }}</div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper { position: relative; width: 100%; height: 100dvh; min-height: 100dvh; overflow: hidden; box-sizing: border-box; padding: 2rem 4vw; background: #edf4fb; }
    .login-wrapper::before { position: absolute; inset: 0; content: ''; background: radial-gradient(circle at 15% 22%, rgba(34,114,190,.12), transparent 28%), radial-gradient(circle at 88% 80%, rgba(52,145,214,.14), transparent 30%); pointer-events: none; }
    .login-shell { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(400px, 1.1fr) minmax(390px, 475px); width: min(1120px, 100%); height: min(700px, calc(100dvh - 4rem)); margin: auto; overflow: hidden; border-radius: 22px; background: #fff; box-shadow: 0 24px 65px rgba(13,58,91,.18); }
    .medical-banner { position: relative; overflow: hidden; background: #0d62ad; }
    .medical-banner img { display: block; width: 200%; height: 100%; max-width: none; object-fit: cover; object-position: left center; }
    .medical-banner::after { position: absolute; inset: 0; content: ''; background: linear-gradient(180deg, transparent 58%, rgba(3,50,98,.5)); pointer-events: none; }
    .medical-banner-caption { position: absolute; z-index: 1; bottom: 2.5rem; left: 2.5rem; display: flex; align-items: center; gap: .75rem; color: #fff; font-size: .9rem; font-weight: 500; }
    .medical-banner-caption i { font-size: 1.8rem; }
    .medical-banner { position: relative; min-height: 590px; overflow: hidden; padding: 3rem; color: #effff6; background: linear-gradient(145deg, #0b7a53 0%, #07513a 72%); }
    .banner-grid { position: absolute; inset: 0; opacity: .16; background-image: linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px); background-size: 32px 32px; transform: rotate(-8deg) scale(1.3); }
    .banner-copy, .monitor-card, .banner-cross, .medical-orbit { position: absolute; z-index: 1; }
    .banner-copy { top: 3rem; left: 3rem; max-width: 320px; }
    .banner-kicker { color: #b7f0ce; font-size: .75rem; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; }
    .banner-copy h1 { margin: 1.5rem 0 1rem; color: #fff; font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.08; }
    .banner-copy h1 strong { color: #b7f0ce; font-weight: 500; }
    .banner-copy p { max-width: 250px; color: #cceede; line-height: 1.6; }
    .medical-orbit { display: grid; place-items: center; width: 58px; height: 58px; border: 1px solid rgba(220,255,235,.48); border-radius: 50%; color: #07513a; background: #b7f0ce; box-shadow: 0 12px 25px rgba(0,0,0,.12); font-size: 1.35rem; }
    .orbit-one { top: 38%; right: 17%; }
    .orbit-two { top: 53%; right: 39%; width: 46px; height: 46px; color: #0b7a53; background: #fff; font-size: 1rem; }
    .orbit-three { top: 65%; right: 13%; width: 70px; height: 70px; color: #fff; background: rgba(255,255,255,.12); font-size: 1.65rem; }
    .monitor-card { right: 2.5rem; bottom: 2.5rem; width: 235px; padding: 1rem; border: 1px solid rgba(220,255,235,.35); border-radius: 13px; background: rgba(3,48,36,.42); box-shadow: 0 20px 35px rgba(0,0,0,.12); }
    .monitor-header { display: flex; align-items: center; gap: .45rem; color: #b7f0ce; }
    .monitor-header span { width: 7px; height: 7px; border-radius: 50%; background: #81efac; box-shadow: 0 0 0 4px rgba(129,239,172,.15); }
    .monitor-header small { margin-right: auto; font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; }
    .pulse-line { display: flex; align-items: center; height: 52px; margin: .45rem 0 .2rem; gap: 3px; }
    .pulse-line span { display: block; width: 22%; height: 2px; background: #a8e6c5; }
    .pulse-line span:nth-child(2) { height: 25px; clip-path: polygon(0 48%, 35% 48%, 55% 0, 72% 100%, 88% 48%, 100% 48%, 100% 55%, 82% 55%, 70% 100%, 53% 15%, 40% 55%, 0 55%); }
    .monitor-card strong { color: #fff; font-size: .8rem; font-weight: 500; }
    .banner-cross { right: 3rem; top: 18%; display: grid; place-items: center; width: 82px; height: 82px; border: 1px solid rgba(255,255,255,.25); border-radius: 24px; color: rgba(255,255,255,.65); transform: rotate(12deg); font-size: 4rem; }
    .login-panel { display: flex; flex-direction: column; justify-content: center; padding: 3.5rem 3.25rem; }
    .login-logo { display: block; width: 110px; height: auto; margin: 0 auto; }
    .login-panel h3 { color: #0b7a53; font-size: 2rem; }
    .brand-name { color: #0b7a53; font-weight: 700; }
    .login-panel .form-control { min-height: 50px; border-color: #d3dfed; color: #244b75; }
    .login-panel .form-control::placeholder { color: #6e87a5; }
    .login-panel .form-control:focus { border-color: #146fe0; box-shadow: 0 0 0 .2rem rgba(20,111,224,.12); }
    .input-with-icon { position: relative; }
    .input-with-icon > i { position: absolute; z-index: 1; top: 50%; left: 1rem; color: #6e87a5; transform: translateY(-50%); font-size: 1.1rem; }
    .input-with-icon .form-control { padding-left: 3rem; }
    .login-options { display: flex; justify-content: space-between; align-items: center; margin: .25rem 0 1.5rem; color: #536f91; font-size: .78rem; }
    .login-options label { display: flex; align-items: center; gap: .25rem; }
    .login-options input { width: 18px; height: 18px; accent-color: #146fe0; }
    .login-options button { padding: 0; border: 0; color: #0b7a53; background: transparent; font: inherit; cursor: pointer; }
    .login-options button:hover { color: #07513a; text-decoration: underline; }
    .login-panel .btn-primary { min-height: 50px; background: #0b7a53; border-color: #0b7a53; }
    .login-panel .btn-primary:hover { background: #07513a; border-color: #07513a; }
    .login-footer { margin-top: 2rem; color: #7187a1; font-size: .75rem; text-align: center; }
    @media (max-width: 767.98px) {
      .login-wrapper { height: 100dvh; min-height: 100dvh; padding: 0; }
      .login-shell { display: block; width: 100%; height: 100%; min-height: 0; border-radius: 0; }
      .medical-banner { height: 29dvh; min-height: 0; }
      .medical-banner img { width: 200%; object-position: left top; }
      .medical-banner-caption { bottom: 1.2rem; left: 1.5rem; font-size: .75rem; }
      .banner-copy { top: 2rem; left: 1.5rem; }
      .banner-copy h1 { margin: .8rem 0 .5rem; font-size: 2rem; }
      .banner-copy p { display: none; }
      .banner-cross { top: 2rem; right: 1.5rem; width: 58px; height: 58px; font-size: 2.8rem; }
      .medical-orbit { transform: scale(.72); }
      .orbit-one { top: 47%; right: 18%; }
      .orbit-two { top: 61%; right: 42%; }
      .orbit-three { top: 54%; right: 3%; }
      .monitor-card { right: 1.5rem; bottom: 1.25rem; width: 190px; padding: .7rem; }
      .pulse-line { height: 30px; }
      .login-panel { height: 71dvh; box-sizing: border-box; padding: 1.5rem 1.5rem 1rem; }
      .login-panel .mb-4 { margin-bottom: 1rem !important; }
      .login-footer { margin-top: 1rem; }
    }
  `]
})
export class LoginComponent {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  erreur = '';
  messageOubli = '';
  chargement = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  seConnecter(): void {
    if (this.form.invalid) return;
    this.chargement = true;
    this.erreur = '';
    this.messageOubli = '';

    this.authService.login(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.chargement = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.chargement = false;
        this.erreur = 'login.erreur';
      }
    });
  }

  motDePasseOublie(): void {
    this.erreur = '';
    this.messageOubli = 'login.contactAdmin';
  }
}
