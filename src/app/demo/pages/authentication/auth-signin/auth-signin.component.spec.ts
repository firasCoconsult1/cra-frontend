import { ComponentFixture, TestBed } from '@angular/core/testing';
import AuthSigninComponent from './auth-signin.component';
import { AuthService } from '../auth-service/authentification.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ResourceManagementService } from '../../resource-management/service/resource-management.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../profile/model/user';
import { CommonModule } from '@angular/common';
import { Component, Directive, Input } from '@angular/core';

describe('AuthSigninComponent', () => {
  let component: AuthSigninComponent;
  let fixture: ComponentFixture<AuthSigninComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const mockUser: User = {
    id: 1,
    fullname: 'John Doe',
    username: 'jdoe',
    numeroTelephone: '123456789',
    imageUrl: '',
    description: '',
    enabled: true,
    invited: false,
    tjm : 0,
    dateSignUp: new Date(),
    leaveBalance:0,
    roles: []
  };

  const disabledUser: User = {
    ...mockUser,
    enabled: false
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getByUsername', 'login', 'setToken']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const userServiceMock = jasmine.createSpyObj('ResourceManagementService', ['']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    
    // Mock traduites pour TranslateService
    translateSpy.instant.and.callFake((key: string) => {
      // Retourne la clé comme valeur pour simplifier
      return key;
    });
    
    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: () => null,
        }
      }
    };

    // Simuler les retours des méthodes
    authSpy.getByUsername.and.returnValue(of(mockUser));
    authSpy.login.and.returnValue(of({ accessToken: 'abc', refreshToken: 'xyz' }));
    
    await TestBed.configureTestingModule({
      imports: [
        AuthSigninComponent,
        CommonModule,
        FormsModule,
        TranslateModule.forRoot()
      ],
     
      providers: [
        { provide: TranslateService, useValue: translateSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerMock },
        { provide: ResourceManagementService, useValue: userServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthSigninComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translateServiceSpy = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    
    // NE PAS appeler fixture.detectChanges() pour éviter de rendre le template qui contient routerLink
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  /*it('should toggle password visibility', () => {
    // Créer un élément de test DOM pour simuler le comportement
    const input = document.createElement('input');
    input.type = 'password';
    input.id = 'signin-password';
    document.body.appendChild(input);

    component.togglePasswordVisibility('signin-password');
    expect(input.type).toBe('text');
    expect(component.passwordVisible).toBeTrue();

    component.togglePasswordVisibility('signin-password');
    expect(input.type).toBe('password');
    expect(component.passwordVisible).toBeFalse();

    document.body.removeChild(input);
  });

  it('should show error message if fields are empty', () => {
    // Préparer les données
    component.loginData.username = '';
    component.loginData.password = '';
    
    // Exécuter la méthode
    component.login();

    // Vérifier le résultat
    expect(component.errorMessage).toBeTruthy();
  });

  it('should show error if user is disabled', () => {
    // Remplacer le mock pour ce test spécifique
    authServiceSpy.getByUsername.and.returnValue(of(disabledUser));
    
    // Préparer les données de test
    component.loginData.username = 'test@example.com';
    component.loginData.password = 'password123';
    
    // Exécuter la méthode
    component.login();

    // Vérifier les assertions
    expect(toastSpy.error).toHaveBeenCalled();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should login and navigate on success', () => {
    // Remettre le mock pour un utilisateur actif
    authServiceSpy.getByUsername.and.returnValue(of(mockUser));
    
    // Préparer les données de test
    component.loginData.username = 'user';
    component.loginData.password = 'pass';
    
    // Exécuter la méthode
    component.login();

    // Vérifier les assertions
    expect(authServiceSpy.setToken).toHaveBeenCalledWith('abc', 'xyz');
    expect(toastSpy.success).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show toast on login error', () => {
    // Préparer les données
    component.loginData.username = 'user';
    component.loginData.password = 'wrongpass';
    
    // Modifier le mock pour simuler une erreur
    authServiceSpy.login.and.returnValue(throwError(() => ({ message: 'Invalid credentials' })));

    // Exécuter la méthode
    component.login();

    // Vérifier le résultat
    expect(toastSpy.error).toHaveBeenCalled();
  });*/
});