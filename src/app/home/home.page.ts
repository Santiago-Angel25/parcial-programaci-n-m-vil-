import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';

import { ApiService, Photos } from '../service/api.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonAvatar,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonModal,
    IonButtons,
    IonButton,
  ],
})
export class HomePage implements OnInit {
  
  private readonly apiService = inject(ApiService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);
  Photo: Photos[] = [];
  albumFilter: number | null = null;
  isLoadingOrders = true;
  apiError: string | null = null;
  isInvoiceOpen = false;
  selectedPhotos: Photos | null = null;
  editTitle = '';
  editAlbumId: number | null = null;
  editStock: number | null = null;
 

  ngOnInit(): void {
    this.apiService.getOrders().subscribe({
      next: (photos) => {
        this.Photo = photos;
        this.isLoadingOrders = false;
        console.log('Órdenes cargadas con éxito:', this.Photo);
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.isLoadingOrders = false;
        this.apiError = 'No se pudieron cargar las órdenes. Revisa tu conexión e inténtalo de nuevo.';
        console.error('Error al cargar las órdenes:', error);
        this.changeDetector.markForCheck();
      },
    });
  }

  get totalStock(): number {
    return this.filteredPhotos.reduce((sum, photos) => sum + photos.stock, 0);
  }

  get criticalStockCount(): number {
    return this.filteredPhotos.filter((photo) => photo.stock < 5).length;
  }

 

  
  openInvoice(photos: Photos): void {
    this.selectedPhotos = photos;
    this.editTitle = photos.title;
    this.editAlbumId = photos.albumId;
    this.editStock = photos.stock;
    this.isInvoiceOpen = true;
  }

  closeInvoice(): void {
    this.isInvoiceOpen = false;
  }

  onInvoiceDismiss(): void {
    this.isInvoiceOpen = false;
    this.selectedPhotos = null;
  }

  async updatePhoto(): Promise<void> {
    const photo = this.selectedPhotos;
    const title = this.editTitle.trim();
    const albumId = Number(this.editAlbumId);
    const stock = Number(this.editStock);

    if (!photo || !title || !Number.isInteger(albumId) || albumId < 1 || albumId > 100 || !Number.isInteger(stock) || stock < 0) {
      const alert = await this.alertController.create({
        header: 'Datos inválidos',
        message: 'Ingresa un título, un álbum entre 1 y 100 y un stock entero igual o mayor que cero.',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }

    photo.title = title;
    photo.albumId = albumId;
    photo.stock = stock;
    this.closeInvoice();

    const toast = await this.toastController.create({
      message: 'Registro actualizado correctamente.',
      duration: 2500,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }

  async resetPhoto(): Promise<void> {
    const photo = this.selectedPhotos;
    if (!photo) return;

    const alert = await this.alertController.create({
      header: '¿Eliminar este registro?',
      message: `Se eliminará la foto #${photo.id} de la lista. Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'confirm' },
      ],
    });
    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role !== 'confirm') return;

    this.Photo = this.Photo.filter((item) => item.id !== photo.id);
    this.closeInvoice();

    const toast = await this.toastController.create({
      message: 'Registro eliminado.',
      duration: 2500,
      color: 'medium',
      position: 'bottom',
    });
    await toast.present();
  }
  
  get filterErrorMessage(): string | null {
    if (this.albumFilter === null) {
      return null;
    }

    if (!Number.isInteger(this.albumFilter) || this.albumFilter < 1 || this.albumFilter > 100) {
      return 'Ingresa un número de álbum entero entre 1 y 100.';
    }

    return null;
  }

 
  get filteredPhotos(): Photos[] {
    if (this.filterErrorMessage !== null) {
      return [];
    }

    return this.albumFilter === null
      ? this.Photo
      : this.Photo.filter((photo) => photo.albumId === this.albumFilter);
  }

  async completeInvoice(): Promise<void> {
    const order = this.selectedPhotos;
    if (!order) return;

    if (order.stock <= 0) {
      const alert = await this.alertController.create({
        header: 'Stock agotado',
        message: 'No hay unidades disponibles para esta orden.',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }

    order.stock -= 1;
    this.closeInvoice();

    const toast = await this.toastController.create({
      message: `Factura completada. Stock restante: ${order.stock}.`,
      duration: 2500,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }
}
