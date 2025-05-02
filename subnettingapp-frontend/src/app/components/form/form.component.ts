import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      ip: ['', Validators.required],
      mask: ['', Validators.required],
      task: ['si', Validators.required],
      hostCounts: [''],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Handle form submission, e.g., navigate to results
      console.log(this.form.value);
    }
  }
}
