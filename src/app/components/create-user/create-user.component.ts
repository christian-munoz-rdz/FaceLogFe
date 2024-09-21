import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { AreaModel } from '../../core/models/area/area.model';
import {
  UserCodeCategoryOptionsModel,
  UserCodePayloadModel,
  UserPayloadModel,
} from '../../core/models/user/user.model';
import { AreaService } from '../../services/area/area.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    DropdownModule,
    CardModule,
    DialogModule,
    FloatLabelModule,
    SkeletonModule,
    DividerModule,
    ReactiveFormsModule,
    InputNumberModule,
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss',
})
export class CreateUserComponent {
  idComponent = 'createUser';

  allAreas!: AreaModel[];
  areasOptions!: AreaModel[];

  categories: UserCodeCategoryOptionsModel[] = [
    { type: 'STUDENT', name: 'Estudiante' },
    { type: 'GRADUATE', name: 'Graduado' },
    { type: 'TEACHER', name: 'Profesor' },
    { type: 'RECTOR', name: 'Rector' },
    { type: 'ADMINISTRATIVE', name: 'Administrativo' },
    { type: 'VOLUNTEER', name: 'Voluntario' },
    { type: 'UNKNOWN', name: 'Desconocido' },
  ];

  saveButtonText = 'Guardar';
  loading = false;
  saving = false;

  codeMinLength = 9;
  codeMaxLength = 10;

  formGroup = new FormGroup({
    area: new FormControl<AreaModel | null>(null, [Validators.required]),
    areas: new FormControl<AreaModel[]>([]),
    name: new FormControl<string>('', [Validators.required]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    role_id: new FormControl<number>(2),
    code: new FormControl<string | null>(null, [
      Validators.required,
      this.numericLengthValidator(this.codeMinLength, this.codeMaxLength),
    ]),
    category: new FormControl<UserCodeCategoryOptionsModel | null>(null, [
      Validators.required,
    ]),
    codes: new FormControl<
      { code: string; category: UserCodeCategoryOptionsModel }[]
    >([]),
  });

  constructor(
    private areaService: AreaService,
    private destroyRef: DestroyRef
  ) {
    this.loading = true;
    this.getAreas();
  }

  getAreas() {
    this.areaService
      .getAllAreas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.allAreas = response;
          console.log('Areas: ', this.allAreas);

          this.areasOptions = this.getAreasOptions(this.allAreas);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener las areas:', error);
        },
      });
  }

  addArea() {
    this.formGroup.controls.areas
      .getRawValue()
      ?.unshift(this.formGroup.controls.area.getRawValue()!);
    this.formGroup.controls.areas.setValue(
      this.formGroup.controls.areas.getRawValue()
    );

    this.formGroup.controls.area.clearValidators();
    this.formGroup.controls.area.reset();

    this.areasOptions = this.getAreasOptions(
      this.allAreas,
      this.formGroup.controls.areas.getRawValue()!
    );
  }

  removeArea(index: number) {
    this.formGroup.controls.areas.getRawValue()?.splice(index, 1);
    this.formGroup.controls.areas.setValue(
      this.formGroup.controls.areas.getRawValue()
    );

    if (this.formGroup.controls.areas.getRawValue()!.length === 0) {
      const areaTmp = this.formGroup.controls.area.getRawValue();

      this.formGroup.controls.area.setValidators([Validators.required]);
      this.formGroup.controls.area.reset();
      this.formGroup.controls.area.setValue(areaTmp);
    }

    this.areasOptions = this.getAreasOptions(
      this.allAreas,
      this.formGroup.controls.areas.getRawValue()!
    );
  }

  addCode() {
    this.formGroup.controls.codes.getRawValue()?.unshift({
      code: this.formGroup.controls.code.getRawValue()!,
      category: this.formGroup.controls.category.getRawValue()!,
    });
    this.formGroup.controls.codes.setValue(
      this.formGroup.controls.codes.getRawValue()
    );

    this.formGroup.controls.code.clearValidators();
    this.formGroup.controls.category.clearValidators();
    this.formGroup.controls.code.reset();
    this.formGroup.controls.category.reset();
  }

  removeCode(index: number) {
    this.formGroup.controls.codes.getRawValue()?.splice(index, 1);
    this.formGroup.controls.codes.setValue(
      this.formGroup.controls.codes.getRawValue()
    );

    if (this.formGroup.controls.codes.getRawValue()!.length === 0) {
      const codeTmp = this.formGroup.controls.code.getRawValue();
      const categoryTmp = this.formGroup.controls.category.getRawValue();

      this.formGroup.controls.code.setValidators([
        Validators.required,
        this.numericLengthValidator(this.codeMinLength, this.codeMaxLength),
      ]);
      this.formGroup.controls.category.setValidators([Validators.required]);
      this.formGroup.controls.code.reset();
      this.formGroup.controls.category.reset();
      this.formGroup.controls.code.setValue(codeTmp);
      this.formGroup.controls.category.setValue(categoryTmp);
    }
  }

  resetArea(): void {
    this.formGroup.controls.area.reset();
  }

  resetCodeCategory(): void {
    this.formGroup.controls.code.reset();
    this.formGroup.controls.category.reset();
  }
  
  getCodeLabel(
    code: { code: string; category: UserCodeCategoryOptionsModel } | null = null
  ): string {
    if (code) {
      return `${code.code} - ${code.category.name}`;
    } else {
      code = {
        code: this.formGroup.getRawValue().code!,
        category: this.formGroup.getRawValue().category!,
      };

      return `${code.code ? code.code : ''} ${
        this.isCodeOrCategoryNull() ? '' : '-'
      } ${code.category ? code.category.name : ''}`;
    }
  }

  getAreasOptions(areas: AreaModel[], filter: AreaModel[] = []): AreaModel[] {
    return areas.filter((area) => {
      return !filter.some((a) => a.id === area.id);
    });
  }

  save(): void {
    this.saving = true;
    this.saveButtonText = 'Guardando';

    const newUser = {
      name: this.formGroup.getRawValue().name,
      email: this.formGroup.getRawValue().email,
      role_id: this.formGroup.getRawValue().role_id,
      codes: this.getCodePostFormat(),
      areas: this.getAreasPostFormat(),
    } as UserPayloadModel;

    console.log('New user: ', newUser);

    console.log('areas GF: ', this.getAreasPostFormat());
  }

  getAreasPostFormat(): any[] {
    return this.formGroup.controls.area.getRawValue()
      ? [
          this.formGroup.controls.area.getRawValue()!,
          ...this.formGroup.controls.areas.getRawValue()!,
        ]
      : this.formGroup.controls.areas.getRawValue()!; //.map((area) => area.id);
  }

  getCodePostFormat(): UserCodePayloadModel[] {
    return (
      !this.isCodeOrCategoryNull()
        ? [
            {
              code: this.formGroup.controls.code.getRawValue(),
              category: this.formGroup.controls.category.getRawValue()!,
            },
            ...this.formGroup.controls.codes.getRawValue()!,
          ]
        : this.formGroup.controls.codes.getRawValue()!
    ).map((code) => {
      return {
        code: code.code,
        category: code.category.type,
      } as UserCodePayloadModel;
    });
  }

  cancel(): void {
    this.saving = false;
    this.saveButtonText = 'Guardar';
  }

  isLoading(): boolean {
    return this.loading || this.saving ? true : false;
  }

  isAreaOptionsEmpty(): boolean {
    return !this.areasOptions || this.areasOptions.length === 0 ? true : false;
  }

  isCodeOrCategoryNull(): boolean {
    return !this.formGroup.controls.code.getRawValue() ||
      !this.formGroup.controls.category.getRawValue()
      ? true
      : false;
  }

  isCodeOrCategoryNotNull(): boolean {
    return this.formGroup.controls.code.getRawValue() ||
      this.formGroup.controls.category.getRawValue()
      ? true
      : false;
  }

  isCodeCategoryValid(withNull: boolean = false): boolean {
    if (
      this.formGroup.getRawValue().code &&
      this.formGroup.getRawValue().category
    ) {
      if (
        this.formGroup.getRawValue().code!.toString().length >=
          this.codeMinLength &&
        this.formGroup.getRawValue().code!.toString().length <=
          this.codeMaxLength
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      if (withNull) {
        if (this.isCodeOrCategoryNotNull()) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }

  isExtraCode(): boolean {
    return this.formGroup.getRawValue().codes!.length > 0 ? true : false;
  }

  numericLengthValidator(minLength: number, maxLength: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      const length = value ? value.toString().length : 0;

      if (length < minLength || length > maxLength) {
        return {
          numericLength: {
            requiredMinLength: minLength,
            requiredMaxLength: maxLength,
            actualLength: length,
          },
        };
      }
      return null;
    };
  }
}
