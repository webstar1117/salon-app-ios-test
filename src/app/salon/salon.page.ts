import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-salon',
  templateUrl: './salon.page.html',
  styleUrls: ['./salon.page.scss'],
})
export class SalonPage implements OnInit {

  options2 = {
    initialSlide: 0,
    slidesPerView:3,
  };
  
  salon_id = 1;
  category:any = 'services';
  type : any = 'haircut';
  guest: boolean = true;
  salon: any;
  safeties: any;
  amenities: any;
  opening_hour: any;
  favorite: false;

  logoUrl = 'https://hairday.app/assets/images/salon-logos/';
  imageUrl = 'https://hairday.app/assets/images/salons/';
  professionalUrl = 'https://hairday.app/assets/images/professionals/';
  avatarUrl = 'https://hairday.app/assets/images/professional-avatars/';
  reviewUrl = 'https://hairday.app/assets/images/reviews/';
  apiUrl = 'https://hairday.app/api/';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  constructor(
    private navCtrl: NavController,
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private iab: InAppBrowser
  ) { }

  ngOnInit() {
    var params = this.router.getCurrentNavigation().extras.state;
    if(params) {
      this.salon_id = params.salon_id;
    }

    this.http.get(this.apiUrl+"salon-detail/"+this.salon_id, this.httpOptions)
    .subscribe(res => {
      console.log(res);
      if(res["status"] == 200){
        this.salon = [res["data"]["salon"]];
        var salon_image_count = this.salon[0].salon_images.length;
        if(salon_image_count < 4){
          this.salon[0].salon_slider = {
            initialSlide: 0,
            slidesPerView:salon_image_count,
          }
        }else{
          this.salon[0].salon_slider = {
            initialSlide: 0,
            slidesPerView:3.2,
          }
        }
        this.safeties = res["data"]["salon"]["health_and_safeties"];
        this.amenities = res["data"]["salon"]["amenities"];
        let opening_hours = res["data"]["salon"]["opening_hours"];
        let today = new Date;
        let week = today.getDay();
        this.opening_hour = opening_hours[week-1];
        for(var i in this.salon[0].professionals){
          var image_count = this.salon[0].professionals[i].professional_images.length;
          if(image_count < 4){
            this.salon[0].professionals[i].slider_option = {
              initialSlide: 0,
              slidesPerView:image_count,
            }
          }else{
            this.salon[0].professionals[i].slider_option = {
              initialSlide: 0,
              slidesPerView:3.6,
            }
          }
        }
        
        for(var i in this.salon[0].reviews){
          var fname = this.salon[0].reviews[i]["user"]["firstname"];
          var lname = this.salon[0].reviews[i]["user"]["lastname"];
          if(fname != null && lname != null){
            this.salon[0].reviews[i]["username"] = fname + " " + lname;
          }else if(fname != null && lname == null){
            this.salon[0].reviews[i]["username"] = fname;
          }else if(fname == null && lname != null){
            this.salon[0].reviews[i]["username"] = lname;
          }else{
            this.salon[0].reviews[i]["username"] = this.salon[0].reviews[i]["user"]["email"];
          }
        }
      }
    }, (err) => {
      console.log(err);
    });
    
    this.checkFavorite();

    if(localStorage.getItem("token") != null){
      this.guest = false;
    }
  }

  checkFavorite(){
    var detail = {salon_id: this.salon_id, api_token: localStorage.getItem('token')};
    this.http.post(this.apiUrl+"salon/favorite/determine", JSON.stringify(detail), this.httpOptions)
    .subscribe(res => {
      if(res["status"] == 200){
        this.favorite = res["data"];
      }else{
        this.favorite = false;
      }
    }, (err) => {
      console.log(err);
    });
  }

  addFavorite(){
    var salon = {salon_id: this.salon_id, api_token: localStorage.getItem('token')};
    this.http.post(this.apiUrl+"salon/favorite/add", JSON.stringify(salon), this.httpOptions)
    .subscribe(res => {
      if(res["status"] == 200){
        this.toastMessage(res["message"]);
        this.checkFavorite();
      }else{
        for(let key in res["message"]){
          this.toastMessage(res["message"][key]);
        }
      }
    }, (err) => {
      console.log(err);
    });
  }

  segmentChanged(category)
  {
    this.category = category;
  }

  dateStringify(dateString){
    var date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: "numeric"});
  }

  toggleAccordion(type): void {
    if(this.type == type){
      this.type = '';
    }else{
      this.type = type;
    }
  }

  selectProfessional(service_id){
    this.navCtrl.navigateForward('professional',{state: {salon_id: this.salon_id, service_id: service_id}});
  }

  selectServices()
  {
    this.navCtrl.navigateForward('services',{state: {salon_id: this.salon_id, services: this.salon[0].services}});
  }

  openUrl(url)
  {
    this.iab.create(url, '_system');
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
