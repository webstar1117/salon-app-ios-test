import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController, ToastController, Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SearchmodalPage } from '../searchmodal/searchmodal.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  city: string = "Location";
  country:string = "location"
  expand: boolean = false;
  services: any;
  popular: any;
  marker: any;
  address: string;
  address2: string;
  guest: boolean = true;
  imageUrl = 'https://hairday.app/assets/images/service-types/';
  apiUrl = 'https://hairday.app/api/';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private platform: Platform ) { }

  ngOnInit() {
    this.http.get(this.apiUrl+"service-types", this.httpOptions)
    .subscribe(res => {
      if(res["status"] == 200){
        this.services = res["data"]["service_types"];
        this.popular = res["data"]["popular_searchs"];
      }
    }, (err) => {
      console.log(err);
    });
    if(localStorage.getItem('token')){
      this.guest = false;
    }
  }

  ionViewDidEnter() {
  }

  onScroll(event) {
    this.expand = false;
  }

  async searchbar() {
    this.expand = true;

    const modal = await this.modalCtrl.create({
      component: SearchmodalPage,
      componentProps: {popular: this.popular, service: ""},
      cssClass: 'searchmodal',
      mode:'ios',
      swipeToClose:true,
      presentingElement: await this.modalCtrl.getTop()
    });
    
    return await modal.present();
  }

  goSearchresult(type, name){
    this.navCtrl.navigateForward('searchresult',{state: {service_type: type, service: name, popular: this.popular}});
  }

  goProfile(){
    if(localStorage.getItem("token") != null){
      this.navCtrl.navigateForward('profile');
    }
  }

  async toastMessage(msg){
    const toast = await this.toastCtrl.create({
      message: msg,
      cssClass: 'ion-text-center',
      duration: 2000
    });
    toast.present();
  }

}
