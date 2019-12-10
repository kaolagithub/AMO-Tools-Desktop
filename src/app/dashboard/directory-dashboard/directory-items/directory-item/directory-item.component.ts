import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Directory } from '../../../../shared/models/directory';
import { IndexedDbService } from '../../../../indexedDb/indexed-db.service';
import { Assessment } from '../../../../shared/models/assessment';
import { ModalDirective } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
import { AssessmentDbService } from '../../../../indexedDb/assessment-db.service';
import { AssessmentService } from '../../../assessment.service';
import { DashboardService } from '../../../dashboard.service';
import { Subscription } from 'rxjs';
import { DirectoryDashboardService } from '../../directory-dashboard.service';

@Component({
  selector: 'app-directory-item',
  templateUrl: './directory-item.component.html',
  styleUrls: ['./directory-item.component.css']
})
export class DirectoryItemComponent implements OnInit {
  @Input()
  directory: Directory;

  editForm: FormGroup;
  allDirectories: Array<Directory>;
  @ViewChild('editModal', { static: false }) public editModal: ModalDirective;
  updateDashboardDataSub: Subscription;
  dashboardView: string;
  dashboardViewSub: Subscription;
  constructor(private indexedDbService: IndexedDbService, private directoryDbService: DirectoryDbService, private assessmentDbService: AssessmentDbService,
    private assessmentService: AssessmentService, private formBuilder: FormBuilder, private dashboardService: DashboardService, private directoryDashboardService: DirectoryDashboardService) { }

  ngOnInit() {
    this.directory.selected = false;
    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.allDirectories = this.directoryDbService.getAll();
      this.populateDirectories(this.directory);
    });

    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
  }

  ngOnDestroy() {
    this.updateDashboardDataSub.unsubscribe();
    this.dashboardViewSub.unsubscribe();
  }

  populateDirectories(directory: Directory) {
    directory.assessments = this.assessmentDbService.getByDirectoryId(directory.id);
    directory.subDirectory = this.directoryDbService.getSubDirectoriesById(directory.id);
  }

  goToAssessment(assessment: Assessment) {
    this.assessmentService.goToAssessment(assessment);
  }

  showEditModal() {
    _.remove(this.allDirectories, (dir) => { return dir.id === this.directory.id; });
    _.remove(this.allDirectories, (dir) => { return dir.parentDirectoryId === this.directory.id; });
    this.editForm = this.formBuilder.group({
      'name': [this.directory.name],
      'directoryId': [this.directory.parentDirectoryId]
    });
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.allDirectories, (dir) => { return dir.id === id; });
    if (parentDir) {
      let str = parentDir.name + '/';
      while (parentDir.parentDirectoryId) {
        parentDir = _.find(this.allDirectories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
        str = parentDir.name + '/' + str;
      }
      return str;
    } else {
      return '';
    }
  }

  save() {
    this.directory.name = this.editForm.controls.name.value;
    this.directory.parentDirectoryId = this.editForm.controls.directoryId.value;
    this.indexedDbService.putDirectory(this.directory).then(val => {
      this.directoryDbService.setAll().then(() => {
        this.dashboardService.updateDashboardData.next(true);
        this.hideEditModal();
      });
    });
  }
}