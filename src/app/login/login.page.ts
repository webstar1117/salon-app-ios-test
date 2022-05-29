import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Facebook } from '@ionic-native/facebook/ngx';
import { SignInWithApple, ASAuthorizationAppleIDRequest, AppleSignInResponse, AppleSignInErrorResponse, } from "@ionic-native/sign-in-with-apple/ngx";
import * as firebase from 'firebase/app';
import 'firebase/auth';





@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  ptype: any = 'password';
  userEmail: string;
  password: string;
  isEmail = false;
  setPassword = false;
  checkPass = true;
  isExist: boolean = false;
  apiUrl = 'https://hairday.app/api/';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),

  };

  constructor(
    private navCtrl: NavController,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private fb: Facebook,
    private signInWithApple: SignInWithApple,

  ) { }

  ngOnInit() {
    if(localStorage.getItem('token')){
      this.navCtrl.navigateRoot('home');
    }
  }

  emailCheck() {
    var regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    this.isEmail = regexp.test(this.userEmail);
  }

  emailExist() {
    var user = { email: this.userEmail }
    this.http.post(this.apiUrl + "check-email", JSON.stringify(user), this.httpOptions)
      .subscribe(res => {
        if (res["status"] == 200) {
          this.isExist = true;
        } else {
          this.isExist = false;
        }
      }, (err) => {
        console.log(err);
      });
  }

  strongPass() {
    var strongRegex = new RegExp("^(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    this.checkPass = strongRegex.test(this.password);
  }

  nextStep() {
    if (this.setPassword == false) {
      this.setPassword = true;
    } else {
      if (this.checkPass) {
        var user = { email: this.userEmail, password: this.password }
        this.http.post(this.apiUrl + "login", JSON.stringify(user), this.httpOptions)
          .subscribe(res => {
            if (res["status"] == 200) {
              this.toastMessage(res["message"]);
              localStorage.setItem('token', res['data']['api_token']);
              this.navCtrl.navigateRoot('home');
            } else {
              for (let key in res["message"]) {
                this.toastMessage(res["message"][key]);
              }
            }
          }, (err) => {
            console.log(err);
          });
      }
    }
  }

  forgotPassword() {
    this.navCtrl.navigateRoot('otpphoneinput');
  }

  switchType() {
    if (this.ptype == 'password') {
      this.ptype = 'text';
    }

    else {
      this.ptype = 'password'
    }
  }

  withGoogle() {
  }

  withFacebook() {
    const permissions = ["public_profile", "email"];
    this.fb.login(permissions)
      .then(res => {
        let userId = res.authResponse.userID;
        // Getting name and gender properties
        this.fb.api("/me?fields=name,email", permissions)
          .then(user => {
            const userEmail = [user]
            this.http.post(this.apiUrl + "login-social", { email: userEmail[0].email })
              .subscribe(res => {
                if (res["status"] == 200) {
                  this.toastMessage(res["message"]);
                  localStorage.setItem('token', res['data']['api_token']);
                  localStorage.setItem('social', 'facebook');
                  this.navCtrl.navigateRoot('home');
                } else {
                  for (let key in res["message"]) {
                    this.toastMessage(res["message"][key]);
                  }
                }
              }, (err) => {
                console.log(err);
              });
          })
      }, error => {
        this.toastMessage("error: " + error.errorMessage);
      });
  }

  withApple() {
    this.signInWithApple
      .signin({
        requestedScopes: [
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
        ]
      })
      .then((res: AppleSignInResponse) => {
        const credential = new firebase.auth.OAuthProvider('apple.com').credential(
          res.identityToken
        );
        const response =  firebase.auth().signInWithCredential(credential).then(async () => {
          console.log(" response" ,  response);
          
          await firebase.auth().onAuthStateChanged(user => {
            if (user) {
              console.log("user"  , JSON.stringify(user));
              const userData:any = [user];
              this.http.post(this.apiUrl + "login-social", { email: userData[0].email })
                .subscribe(res => {
                  if (res["status"] == 200) {
                    this.toastMessage(res["message"]);
                    localStorage.setItem('token', res['data']['api_token']);
                    localStorage.setItem('social', 'apple');
                    this.navCtrl.navigateRoot('home');
                  } else {
                    for (let key in res["message"]) {
                      this.toastMessage(res["message"][key]);
                    }
                  }
                }, (err) => {
                  console.log(err);
                });
            }
          })
        })
      })
      .catch((error: AppleSignInErrorResponse) => {
        this.toastMessage("error: " + error);
      });
  }

  async toastMessage(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      cssClass: 'ion-text-center',
      duration: 2000
    });
    toast.present();
  }

}
