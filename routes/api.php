<?php
use App\Http\Controllers\Reports\FinancialManagementReportsController;
use App\Http\Controllers\DispensingDashboardController;
use App\Http\Controllers\Reports\InventoryManagementReportsController;
use App\Http\Controllers\PaymentCenterDashboardController;
use App\Http\Controllers\Reports\PaymentCenterReportsController;
use App\Http\Controllers\ReceptionDashboardController;
use App\Http\Controllers\DirectorDashboardController;
use App\Http\Controllers\TriageController;
use App\Http\Controllers\EmergencyController;
use App\Http\Controllers\LaboratoryController;
use App\Http\Controllers\RadiologyController;
use App\Http\Controllers\EPrescriptionsController;
use App\Http\Controllers\InsuranceClaimsController;
use App\Http\Controllers\InsuranceCompaniesController;
use App\Http\Controllers\PatientInsurancesController;
use App\Http\Controllers\InpatientController;
use App\Http\Controllers\OperatingTheatreController;
use App\Http\Controllers\AnesthesiaController;
use App\Http\Controllers\BloodBankController;
use App\Http\Controllers\AmbulanceController;
use App\Http\Controllers\MortuaryController;
use App\Http\Controllers\InpatientBillingController;
use App\Http\Controllers\WardRecordsController;
use App\Http\Controllers\AppointmentsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CataractSurgeryRecordsController;
use App\Http\Controllers\ClinicsController;
use App\Http\Controllers\ConsultationDiagnosesController;
use App\Http\Controllers\ConsultationsController;
use App\Http\Controllers\ConsultationTypesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\DiseasesController;
use App\Http\Controllers\OccupationsController;
use App\Http\Controllers\PatientsToReturnController;
use App\Http\Controllers\EmployeeSalesPerformanceController;
use App\Http\Controllers\LensStockController;
use App\Http\Controllers\DistrictsController;
use App\Http\Controllers\ExpenseCategoriesController;
use App\Http\Controllers\ExpensePaymentsController;
use App\Http\Controllers\ExpensesController;
use App\Http\Controllers\ItemPricesController;
use App\Http\Controllers\ItemsController;
use App\Http\Controllers\ItemTypesController;
use App\Http\Controllers\JobTitlesController;
use App\Http\Controllers\LensTypesController;
use App\Http\Controllers\Marketing\BulkSmsController;
use App\Http\Controllers\Marketing\CampaignPerformanceController;
use App\Http\Controllers\Marketing\ClientCallingStatusController;
use App\Http\Controllers\Marketing\LeadGenerationController;
use App\Http\Controllers\Marketing\CommunicationLogsController;
use App\Http\Controllers\Marketing\CommunicationAnalyticsController;
use App\Http\Controllers\Marketing\DailyActivitiesController;
use App\Http\Controllers\Marketing\EventsController;
use App\Http\Controllers\Marketing\HighValuePatientsController;
use App\Http\Controllers\Marketing\IdeasController;
use App\Http\Controllers\Marketing\InformationSourcesController;
use App\Http\Controllers\Marketing\MarketingDashboardController;
use App\Http\Controllers\Marketing\MarketingStrategiesController;
use App\Http\Controllers\Marketing\PrestigeClientsController;
use App\Http\Controllers\Marketing\ResearchPlansController;
use App\Http\Controllers\Marketing\UnreachableNumbersController;
use App\Http\Controllers\Marketing\WhatsAppExportController;
use App\Http\Controllers\MessagesController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\PatientAttachmentsController;
use App\Http\Controllers\PatientCheckInsController;
use App\Http\Controllers\PatientItemBillPaymentsController;
use App\Http\Controllers\PatientItemBillsController;
use App\Http\Controllers\PatientItemPaymentsController;
use App\Http\Controllers\PatientPaymentCacheController;
use App\Http\Controllers\PatientPaymentCacheItemsController;
use App\Http\Controllers\PatientsController;
use App\Http\Controllers\PatientWaitingTimesController;
use App\Http\Controllers\DoctorTasksController;
use App\Http\Controllers\PaymentChannelsController;
use App\Http\Controllers\PaymentModesController;
use App\Http\Controllers\PreferencesController;
use App\Http\Controllers\RegionsController;
use App\Http\Controllers\CRMReportsController;
use App\Http\Controllers\DepartmentPerformanceController;
use App\Http\Controllers\StocktakesController;
use App\Http\Controllers\SurgeryRecordReportsController;
use App\Http\Controllers\UnitsOfMeasureController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\WardsController;
use App\Http\Controllers\StockAlertsController;
use App\Http\Controllers\MedicineTakingController;
use App\Http\Controllers\MedicinesController;
use App\Http\Controllers\PatientNotificationsController;
use App\Http\Controllers\MedicineCenterDashboardController;
use App\Http\Controllers\OtherDispensingDashboardController;
use App\Http\Controllers\InventoryManagementDashboardController;
use App\Http\Controllers\FinancialManagementDashboardController;
use App\Http\Controllers\ProcedureRoomDashboardController;
use App\Http\Controllers\ConsultationRoomDashboardController;
use App\Http\Controllers\OpticianCenterDashboardController;
use App\Http\Controllers\SalesCenterDashboardController;
use App\Http\Controllers\SalesCenterPrescriptionsController;
use App\Http\Controllers\SalesManagementDashboardController;
use App\Http\Controllers\EmployeePerformanceController;
use App\Http\Controllers\OfficeCalendarController;
use App\Http\Controllers\OfficeCalendarSubscribersController;
use App\Http\Controllers\OfficeCalendarContactSubmissionsController;
use App\Http\Controllers\EmployeeReportsController;
use App\Http\Controllers\ReferralsController;
use App\Http\Controllers\ExternalLinksEmailAlertsController;
use App\Http\Controllers\ExternalLinksWebsiteAppointmentsController;
use App\Http\Controllers\PerformanceDashboardController;
use App\Http\Controllers\Marketing\CrmReportCardController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Authentication routes with rate limiting
Route::group(['prefix' => 'auth'], function ($router) {
    $router->post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1'); // 5 attempts per minute
});

// Public routes - accessible without authentication
Route::get('/units-of-measure', [UnitsOfMeasureController::class, 'index']);
Route::post('/appointments', [AppointmentsController::class, 'store']);
Route::post('/office-calendar/subscribers', [OfficeCalendarSubscribersController::class, 'store']);
Route::post('/office-calendar/contact-submissions', [OfficeCalendarContactSubmissionsController::class, 'store']);

// Health check endpoint
Route::get('/health', function () {
    try {
        // Test database connection
        DB::connection()->getPdo();
        return response()->json([
            'status' => 'healthy',
            'database' => 'connected',
            'timestamp' => now()->toISOString()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'unhealthy',
            'database' => 'disconnected',
            'error' => $e->getMessage(),
            'timestamp' => now()->toISOString()
        ], 500);
    }
});

// Notifications route - requires auth to get user's clinic_id for proper filtering
Route::get('/notifications', [NotificationsController::class, '__invoke'])->middleware('auth:api');
Route::get('/notifications/dynamic', [NotificationsController::class, 'getDynamicNotifications'])->middleware('auth:api');

// Shared patient read routes - accessible by multiple roles
Route::group(['middleware' => ['auth:api']], function ($router) {
    $router->controller(PatientsController::class)->prefix('patients')->group(function ($router) {
        $router->get('/', 'index');
        $router->get('/{id}', 'show');
    });
});

// Triage routes - require triage privilege
Route::group(['middleware' => ['auth:api', 'privilege:triage']], function ($router) {
    $router->controller(TriageController::class)->prefix('triage')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/queue', 'queue');
        $router->post('/vital-signs', 'store');
        $router->get('/vital-signs/{id}', 'show');
        $router->match(['put', 'patch'], '/vital-signs/{id}', 'update');
        $router->delete('/vital-signs/{id}', 'destroy');
        $router->get('/patients/{patientId}/vital-signs', 'patientHistory');
    });
});

// Emergency / ER routes - require triage privilege
Route::group(['middleware' => ['auth:api', 'privilege:triage']], function ($router) {
    $router->controller(EmergencyController::class)->prefix('emergency')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/visits', 'index');
        $router->post('/visits', 'store');
        $router->get('/visits/{id}', 'show');
        $router->match(['put', 'patch'], '/visits/{id}', 'update');
        $router->post('/visits/{id}/start-treatment', 'startTreatment');
        $router->post('/visits/{id}/admit', 'admit');
        $router->post('/visits/{id}/discharge', 'discharge');
        $router->get('/patients/{patientId}/history', 'patientHistory');
        $router->get('/staff', 'staff');
    });

    // Ambulance / patient transport routes
    $router->controller(AmbulanceController::class)->prefix('ambulance')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/vehicles', 'vehicles');
        $router->post('/vehicles', 'storeVehicle');
        $router->match(['put', 'patch'], '/vehicles/{id}', 'updateVehicle');
        $router->get('/requests', 'requests');
        $router->post('/requests', 'storeRequest');
        $router->get('/requests/{id}', 'showRequest');
        $router->post('/requests/{id}/assign', 'assign');
        $router->get('/trips', 'trips');
        $router->post('/trips/{id}/advance', 'advanceTrip');
        $router->get('/staff', 'staff');
    });
});

// Laboratory routes - require laboratory privilege
Route::group(['middleware' => ['auth:api', 'privilege:laboratory']], function ($router) {
    $router->controller(LaboratoryController::class)->prefix('laboratory')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/tests', 'tests');
        $router->post('/tests', 'storeTest');
        $router->match(['put', 'patch'], '/tests/{id}', 'updateTest');
        $router->delete('/tests/{id}', 'destroyTest');
        $router->get('/requests', 'requests');
        $router->post('/requests', 'storeRequest');
        $router->get('/requests/{id}', 'showRequest');
        $router->post('/requests/{id}/collect-sample', 'collectSample');
        $router->post('/requests/{id}/results', 'enterResults');
        $router->post('/requests/{id}/cancel', 'cancelRequest');
        $router->get('/patients/{patientId}/history', 'patientHistory');
    });
});

// Radiology routes - require radiology privilege
Route::group(['middleware' => ['auth:api', 'privilege:radiology']], function ($router) {
    $router->controller(RadiologyController::class)->prefix('radiology')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/exams', 'exams');
        $router->post('/exams', 'storeExam');
        $router->match(['put', 'patch'], '/exams/{id}', 'updateExam');
        $router->delete('/exams/{id}', 'destroyExam');
        $router->get('/requests', 'requests');
        $router->post('/requests', 'storeRequest');
        $router->get('/requests/{id}', 'showRequest');
        $router->post('/requests/{id}/performed', 'markPerformed');
        $router->post('/requests/{id}/results', 'enterResults');
        $router->post('/requests/{id}/cancel', 'cancelRequest');
        $router->get('/patients/{patientId}/history', 'patientHistory');
    });
});

// E-Prescription routes - require e_prescription privilege
Route::group(['middleware' => ['auth:api', 'privilege:e_prescription']], function ($router) {
    $router->controller(EPrescriptionsController::class)->prefix('e-prescription')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/medicines', 'medicines');
        $router->get('/', 'index');
        $router->post('/', 'store');
        $router->get('/{id}', 'show');
        $router->post('/{id}/dispense', 'dispense');
        $router->post('/{id}/send-to-pharmacy', 'sendToPharmacy');
        $router->post('/{id}/cancel', 'cancel');
        $router->get('/patients/{patientId}/history', 'patientHistory');
    });
});

// Inpatient routes - require wards privilege
Route::group(['middleware' => ['auth:api', 'privilege:wards']], function ($router) {
    $router->controller(InpatientController::class)->prefix('inpatient')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/wards', 'wards');
        $router->post('/wards', 'storeWard');
        $router->match(['put', 'patch'], '/wards/{id}', 'updateWard');
        $router->delete('/wards/{id}', 'destroyWard');
        $router->get('/beds', 'beds');
        $router->post('/beds', 'storeBed');
        $router->match(['put', 'patch'], '/beds/{id}', 'updateBed');
        $router->delete('/beds/{id}', 'destroyBed');
        $router->get('/admissions', 'admissions');
        $router->post('/admissions', 'admit');
        $router->get('/admissions/{id}', 'showAdmission');
        $router->post('/admissions/{id}/discharge', 'discharge');
        $router->post('/admissions/{id}/transfer', 'transfer');
        $router->get('/notes', 'notes');
        $router->post('/notes', 'storeNote');
        $router->delete('/notes/{id}', 'destroyNote');
        $router->get('/patients/{patientId}/history', 'patientHistory');
    });
});

// Inpatient Billing routes - require wards privilege
Route::group(['middleware' => ['auth:api', 'privilege:wards']], function ($router) {
    $router->controller(InpatientBillingController::class)->prefix('inpatient-billing')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/charges', 'accruals');
        $router->post('/charges/accrue', 'runAccrual');
        $router->post('/charges', 'manualCharge');
        $router->post('/charges/{id}/void', 'voidCharge');
        $router->get('/bills', 'bills');
        $router->get('/bills/{id}', 'showBill');
        $router->post('/bills', 'createBill');
        $router->post('/bills/{id}/payments', 'addPayment');
        $router->get('/payment-modes', 'paymentModes');
    });
});

// Ward clinical records routes (discharge summaries, nursing charts, fluid balance, MAR) - require wards privilege
Route::group(['middleware' => ['auth:api', 'privilege:wards']], function ($router) {
    $router->controller(WardRecordsController::class)->prefix('ward-records')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/discharge-summaries', 'dischargeSummaries');
        $router->post('/discharge-summaries', 'storeDischargeSummary');
        $router->get('/discharge-summaries/{id}', 'showDischargeSummary');
        $router->post('/discharge-summaries/{id}/finalize', 'finalizeDischargeSummary');
        $router->get('/nursing-charts', 'nursingCharts');
        $router->post('/nursing-charts', 'storeNursingChart');
        $router->delete('/nursing-charts/{id}', 'destroyNursingChart');
        $router->get('/fluid-balances', 'fluidBalances');
        $router->post('/fluid-balances', 'storeFluidBalance');
        $router->delete('/fluid-balances/{id}', 'destroyFluidBalance');
        $router->get('/mar', 'mar');
        $router->post('/mar', 'storeMar');
        $router->post('/mar/{id}/status', 'updateMarStatus');
        $router->delete('/mar/{id}', 'destroyMar');
        $router->get('/staff', 'staff');
    });
});

// Operating Theatre routes - require wards privilege
Route::group(['middleware' => ['auth:api', 'privilege:wards']], function ($router) {
    $router->controller(OperatingTheatreController::class)->prefix('operating-theatre')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/theatres', 'theatres');
        $router->post('/theatres', 'storeTheatre');
        $router->match(['put', 'patch'], '/theatres/{id}', 'updateTheatre');
        $router->delete('/theatres/{id}', 'destroyTheatre');
        $router->get('/surgeries', 'surgeries');
        $router->post('/surgeries', 'store');
        $router->get('/surgeries/{id}', 'show');
        $router->match(['put', 'patch'], '/surgeries/{id}', 'update');
        $router->post('/surgeries/{id}/ready', 'markReady');
        $router->post('/surgeries/{id}/start', 'startSurgery');
        $router->post('/surgeries/{id}/complete', 'completeSurgery');
        $router->post('/surgeries/{id}/cancel', 'cancelSurgery');
        $router->post('/surgeries/{id}/notes', 'storeNote');
        $router->delete('/notes/{id}', 'destroyNote');
        $router->get('/patients/{patientId}/history', 'patientHistory');
        $router->get('/staff', 'staff');
        $router->get('/admissions', 'admissions');
    });
});

// Anesthesia routes - require wards privilege
Route::group(['middleware' => ['auth:api', 'privilege:wards']], function ($router) {
    $router->controller(AnesthesiaController::class)->prefix('anesthesia')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/records', 'index');
        $router->post('/records', 'store');
        $router->get('/records/{id}', 'show');
        $router->match(['put', 'patch'], '/records/{id}', 'update');
        $router->post('/records/{id}/start', 'start');
        $router->post('/records/{id}/complete', 'complete');
        $router->post('/records/{id}/cancel', 'cancel');
        $router->post('/records/{id}/vitals', 'storeVital');
        $router->delete('/vitals/{id}', 'destroyVital');
        $router->get('/patients/{patientId}/history', 'patientHistory');
        $router->get('/staff', 'staff');
    });
});

// Blood Bank routes - require laboratory privilege
Route::group(['middleware' => ['auth:api', 'privilege:laboratory']], function ($router) {
    $router->controller(BloodBankController::class)->prefix('blood-bank')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/units', 'units');
        $router->post('/units', 'storeUnit');
        $router->match(['put', 'patch'], '/units/{id}', 'updateUnit');
        $router->get('/donors', 'donors');
        $router->post('/donors', 'storeDonor');
        $router->match(['put', 'patch'], '/donors/{id}', 'updateDonor');
        $router->get('/transfusions', 'transfusions');
        $router->get('/transfusions/{id}', 'showTransfusion');
        $router->post('/transfusions', 'storeTransfusion');
        $router->post('/transfusions/{id}/cross-match', 'crossMatch');
        $router->post('/transfusions/{id}/start', 'start');
        $router->post('/transfusions/{id}/complete', 'complete');
        $router->post('/transfusions/{id}/cancel', 'cancel');
        $router->get('/patients/{patientId}/history', 'patientHistory');
        $router->get('/staff', 'staff');
    });
});

// Mortuary routes - require wards privilege
Route::group(['middleware' => ['auth:api', 'privilege:wards']], function ($router) {
    $router->controller(MortuaryController::class)->prefix('mortuary')->group(function ($router) {
        $router->get('/dashboard', 'dashboard');
        $router->get('/bodies', 'bodies');
        $router->post('/bodies', 'storeBody');
        $router->get('/bodies/{id}', 'showBody');
        $router->match(['put', 'patch'], '/bodies/{id}', 'updateBody');
        $router->post('/bodies/{id}/release', 'releaseBody');
        $router->get('/certificates', 'certificates');
        $router->get('/certificates/{id}', 'showCertificate');
        $router->post('/certificates', 'storeCertificate');
        $router->post('/certificates/{id}/issue', 'issueCertificate');
        $router->post('/certificates/{id}/void', 'voidCertificate');
        $router->get('/staff', 'staff');
    });
});

// Reception routes - require reception privilege
Route::group(['middleware' => ['auth:api', 'privilege:reception']], function ($router) {
    $router->controller(PatientsController::class)->prefix('patients')->group(function ($router) {
        $router->post('/', 'store');
        $router->put('/{id}', 'update');
        $router->delete('/{id}', 'destroy');
    });
    
    $router->controller(PatientsToReturnController::class)->prefix('patients-to-return')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/{id}/return', 'markAsReturned');
    });
    
    $router->controller(MessagesController::class)->prefix('messages')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
    });
});

// Cashier routes - require payment_center privilege
Route::group(['middleware' => ['auth:api', 'privilege:payment_center']], function ($router) {
    $router->controller(PatientPaymentCacheController::class)->prefix('patient-payment-cache')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
        $router->get('/{id}', 'show');
        $router->put('/{id}', 'update');
    });
    
    $router->controller(PatientItemBillsController::class)->prefix('patient-bills')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
        $router->get('/{id}', 'show');
        $router->put('/{id}', 'update');
    });
    
    $router->controller(ExpensesController::class)->prefix('expenses')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
        $router->get('/{id}', 'show');
        $router->put('/{id}', 'update');
    });
});

// Consultation room routes - require consultation_room privilege
Route::group(['middleware' => ['auth:api', 'privilege:consultation_room']], function ($router) {
    $router->controller(ConsultationsController::class)->prefix('consultations')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
        // Note: show method moved to main auth group for receptionist access
        $router->put('/{id}', 'update');
    });
    
    $router->controller(ConsultationDiagnosesController::class)->prefix('consultation-diagnoses')->group(function ($router) {
        $router->get('/', 'index');
        $router->post('/', 'store');
        $router->get('/{id}', 'show');
        $router->put('/{id}', 'update');
    });
});

// Marketing routes - require marketing privilege
Route::group(['middleware' => ['auth:api', 'privilege:marketing']], function ($router) {
    $router->controller(MarketingDashboardController::class)->prefix('marketing')->group(function ($router) {
        $router->get('/dashboard', '__invoke');
    });
    
    $router->controller(DailyActivitiesController::class)->prefix('marketing')->group(function ($router) {
        $router->get('/daily-activities', 'index');
        $router->post('/daily-activities', 'store');
        $router->put('/daily-activities/{id}', 'update');
        $router->delete('/daily-activities/{id}', 'destroy');
    });
    
    $router->controller(MarketingStrategiesController::class)->prefix('marketing')->group(function ($router) {
        $router->get('/marketing-strategies', 'index');
        $router->post('/marketing-strategies', 'store');
        $router->put('/marketing-strategies/{id}', 'update');
        $router->delete('/marketing-strategies/{id}', 'destroy');
    });
    
    $router->controller(PrestigeClientsController::class)->prefix('marketing')->group(function ($router) {
        $router->get('/prestige-clients', 'index');
        $router->get('/prestige-clients/{id}', 'show');
    });
});

// Employee management routes - require employee_management privilege
Route::group(['middleware' => ['auth:api', 'privilege:employee_management']], function ($router) {
    $router->apiResource('/users', UsersController::class);
    $router->apiResource('/job-titles', JobTitlesController::class);
    $router->apiResource('/departments', DepartmentsController::class);
    $router->apiResource('/clinics', ClinicsController::class);
});

// Main authenticated routes group
Route::group(['middleware' => 'auth:api'], function ($router) {
    $router->controller(AuthController::class)->prefix('auth')->group(function ($router) {
        $router->post('/change-password', 'changePassword');
        $router->get('/user', 'getAuthUser');
    });

    // Main Dashboard Route - moved inside auth group
    $router->get('/dashboard', [DashboardController::class, '__invoke']);

     // VIP Patients - move this inside the main auth group
    $router->get('/patients/vip', [PatientsController::class, 'vipPatients']);
    
    // Patient Waiting Times
    $router->prefix('patient-waiting-times')->group(function ($router) {
        $router->get('/', [PatientWaitingTimesController::class, 'index']);
        $router->get('/statistics', [PatientWaitingTimesController::class, 'statistics']);
        $router->post('/{id}/start-treatment', [PatientWaitingTimesController::class, 'startTreatment']);
        $router->post('/{id}/end-treatment', [PatientWaitingTimesController::class, 'endTreatment']);
        $router->post('/{id}/force-complete-treatment', [PatientWaitingTimesController::class, 'forceCompleteTreatment']);
        $router->post('/{id}/send-to-cashier', [PatientWaitingTimesController::class, 'sendToCashier']);
        $router->post('/{id}/send-to-consultation', [PatientWaitingTimesController::class, 'sendToConsultation']);
        $router->post('/{id}/send-to-dispensing', [PatientWaitingTimesController::class, 'sendToDispensing']);
        $router->post('/{id}/send-to-procedure-room', [PatientWaitingTimesController::class, 'sendToProcedureRoom']);
        $router->post('/{id}/move-to-department', [PatientWaitingTimesController::class, 'moveToDepartment']);
    });
    
    // Doctor Tasks feature removed as per request
    /*
    $router->prefix('doctor-tasks')->group(function ($router) {
        $router->get('/', [DoctorTasksController::class, 'index']);
        $router->get('/statistics', [DoctorTasksController::class, 'statistics']);
        $router->get('/doctor/{doctorId}', [DoctorTasksController::class, 'doctorTasks']);
        $router->post('/', [DoctorTasksController::class, 'store']);
        $router->post('/{id}/start', [DoctorTasksController::class, 'startTask']);
        $router->post('/{id}/complete', [DoctorTasksController::class, 'completeTask']);
    });
    
    // Main Dashboard Route - no authentication required
    $router->get('/dashboard', [DashboardController::class, '__invoke']);
    // $router->get('/notifications', [NotificationsController::class, '__invoke']);
    // $router->get('/notifications/dynamic', [NotificationsController::class, 'getDynamicNotifications']);
    
    // Patient Notifications
    $router->prefix('patient-notifications')->group(function ($router) {
        $router->get('/', [PatientNotificationsController::class, 'index']);
        $router->get('/unread-count', [PatientNotificationsController::class, 'unreadCount']);
        $router->post('/{id}/mark-as-read', [PatientNotificationsController::class, 'markAsRead']);
        $router->post('/mark-all-as-read', [PatientNotificationsController::class, 'markAllAsRead']);
        $router->delete('/{id}', [PatientNotificationsController::class, 'destroy']);
    });
    */
    $router->apiResource('/appointments', AppointmentsController::class)->except(['store']);
    $router->apiResource('/payment-modes', PaymentModesController::class);
    $router->apiResource('/payment-channels', PaymentChannelsController::class);
    // Units of measure - only CRUD operations (index is public)
    $router->post('/units-of-measure', [UnitsOfMeasureController::class, 'store']);
    $router->get('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'show']);
    $router->put('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'update']);
    $router->delete('/units-of-measure/{id}', [UnitsOfMeasureController::class, 'destroy']);
    $router->apiResource('/lens-types', LensTypesController::class);
    $router->apiResource('/item-types', ItemTypesController::class);
    $router->apiResource('/consultation-types', ConsultationTypesController::class);
    $router->apiResource('/items', ItemsController::class);
    $router->apiResource('/item-prices', ItemPricesController::class);
    $router->apiResource('/regions', RegionsController::class);
    $router->apiResource('/districts', DistrictsController::class);
    $router->apiResource('/wards', WardsController::class);
    $router->apiResource('/diseases', DiseasesController::class);
    $router->apiResource('/occupations', OccupationsController::class);
    
    // Office Calendar
    $router->prefix('office-calendar')->group(function ($router) {
        $router->get('/', [OfficeCalendarController::class, 'index']);
        $router->post('/', [OfficeCalendarController::class, 'store']);
        $router->get('/upcoming-reminders', [OfficeCalendarController::class, 'getUpcomingReminders']);
        
        // Newsletter Subscribers (GET only - POST is public) - Must be before /{id} route
        $router->get('/subscribers', [OfficeCalendarSubscribersController::class, 'index']);
        
        // Contact Submissions (GET only - POST is public) - Must be before /{id} route
        $router->get('/contact-submissions', [OfficeCalendarContactSubmissionsController::class, 'index']);
        
        $router->post('/{id}/mark-reminder-sent', [OfficeCalendarController::class, 'markReminderSent']);
        $router->get('/{id}', [OfficeCalendarController::class, 'show']);
        $router->put('/{id}', [OfficeCalendarController::class, 'update']);
        $router->delete('/{id}', [OfficeCalendarController::class, 'destroy']);
    });
    
    // Financial management routes - require financial_management privilege
    Route::group(['middleware' => ['auth:api', 'privilege:financial_management']], function ($router) {
        $router->controller(FinancialManagementReportsController::class)->prefix('financial-management')->group(function ($router) {
            $router->get('/dashboard', '__invoke');
            $router->get('/reports', 'index');
            $router->get('/reports/revenue-collection', 'getRevenueCollectionReport');
            $router->get('/reports/expenses', 'getExpenseReport');
        });

        // Insurance / NHIF companies
        $router->controller(InsuranceCompaniesController::class)->prefix('insurance-company')->group(function ($router) {
            $router->get('/', 'index');
            $router->post('/', 'store');
            $router->get('/{id}', 'show');
            $router->match(['put', 'patch'], '/{id}', 'update');
            $router->delete('/{id}', 'destroy');
        });

        // Patient insurance memberships
        $router->controller(PatientInsurancesController::class)->prefix('patient-insurance')->group(function ($router) {
            $router->get('/patients/{patientId}', 'index');
            $router->post('/', 'store');
            $router->match(['put', 'patch'], '/{id}', 'update');
            $router->delete('/{id}', 'destroy');
        });

        // Insurance / NHIF claims
        $router->controller(InsuranceClaimsController::class)->prefix('insurance-claim')->group(function ($router) {
            $router->get('/dashboard', 'dashboard');
            $router->get('/', 'index');
            $router->post('/', 'store');
            $router->get('/patients/{patientId}/history', 'patientHistory');
            $router->get('/{id}', 'show');
            $router->post('/{id}/submit', 'submit');
            $router->post('/{id}/approve', 'approve');
            $router->post('/{id}/reject', 'reject');
            $router->post('/{id}/pay', 'pay');
        });
    });
    
    // Employee Reports
    $router->prefix('employee-reports')->group(function ($router) {
        $router->get('/my-reports', [EmployeeReportsController::class, 'myReports']);
        $router->post('/{id}/submit', [EmployeeReportsController::class, 'submit']);
        $router->post('/{id}/approve', [EmployeeReportsController::class, 'approve']);
        $router->post('/{id}/reject', [EmployeeReportsController::class, 'reject']);
        $router->get('/', [EmployeeReportsController::class, 'index']);
        $router->post('/', [EmployeeReportsController::class, 'store']);
        $router->get('/{id}', [EmployeeReportsController::class, 'show']);
        $router->put('/{id}', [EmployeeReportsController::class, 'update']);
        $router->delete('/{id}', [EmployeeReportsController::class, 'destroy']);
    });
    
    // External Links
    $router->prefix('external-links')->group(function ($router) {
        // Email Alerts
        $router->prefix('email-alerts')->group(function ($router) {
            $router->get('/settings', [ExternalLinksEmailAlertsController::class, 'getSettings']);
            $router->put('/settings', [ExternalLinksEmailAlertsController::class, 'updateSettings']);
        });
        
        // Website Appointments
        $router->prefix('website-appointments')->group(function ($router) {
            $router->get('/', [ExternalLinksWebsiteAppointmentsController::class, 'index']);
            $router->patch('/{id}', [ExternalLinksWebsiteAppointmentsController::class, 'update']);
        });
    });
    $router->get('/patients-to-return/this-week', [PatientsToReturnController::class, 'getThisWeek']);
    Route::group(["middleware" => ["auth:api"]], function ($router) {
        $router->get('/return-patient-percentage', [ReceptionDashboardController::class, 'getReturnPatientPercentage']);
    });
    $router->get('/employee-sales-performance', [EmployeeSalesPerformanceController::class, 'getAllEmployeesSalesPerformance']);
    $router->get('/employee-sales-performance/{employeeId}', [EmployeeSalesPerformanceController::class, 'getEmployeeSalesPerformance']);
    $router->get('/lens-stock', [LensStockController::class, 'index']);

    $router->apiResource('/patients', PatientsController::class);
    $router->apiResource('/patient-check-ins', PatientCheckInsController::class);
    $router->apiResource('/patient-attachments', PatientAttachmentsController::class);

    // Patient referrals route
    $router->get('/patients/{patient_id}/referrals', [ReferralsController::class, 'getPatientReferrals']);

    $router->apiResource('/patient-payment-cache', PatientPaymentCacheController::class);
    $router->apiResource('/patient-payment-cache-items', PatientPaymentCacheItemsController::class);
    $router->controller(PatientPaymentCacheItemsController::class)->prefix('patient-payment-cache-items')->group(function ($router) {
        $router->post('/make-cash-payment', 'makeCashPayment');
        $router->post('/approve-credit-payment', 'approveCreditPayment');
        $router->post('/create-bill', 'createBill');
        $router->post('/create-invoice', 'createInvoice');
        $router->post('/dispense', 'dispense');
        $router->post('/complete', 'complete');
    });
    $router->apiResource('/patient-item-payments', PatientItemPaymentsController::class);

    $router->apiResource('/patient-item-bills', PatientItemBillsController::class);
    $router->patch('/patient-item-bills/{id}/clear', [PatientItemBillsController::class, 'clear']);
    $router->apiResource('/patient-item-bill-payments', PatientItemBillPaymentsController::class);

    $router->apiResource('/consultations', ConsultationsController::class);
    $router->controller(ConsultationsController::class)->prefix('consultations')->group(function ($router) {
        $router->get('/{id}', 'show'); // Explicitly add show method for receptionist access
        $router->post('/add-item', 'addItem');
        $router->patch('/{id}/auto-save-clinical-notes', 'autoSaveClinicalNotes');
        $router->patch('/{id}/complete-clinical-notes', 'completeClinicalNotes');
    });
    $router->apiResource('/referrals', ReferralsController::class);
    $router->apiResource('/surgery-record-reports', SurgeryRecordReportsController::class);
    $router->apiResource('/cataract-surgery-records', CataractSurgeryRecordsController::class);

    $router->apiResource('/consultation-diagnoses', ConsultationDiagnosesController::class);
    $router->apiResource('/stocktakes', StocktakesController::class);
    $router->post('/stocktakes/{id}/apply', [StocktakesController::class, 'apply']);
    
    // Stock Alerts
    $router->prefix('stock-alerts')->group(function ($router) {
        $router->get('/out-of-stock', [StockAlertsController::class, 'getOutOfStockItems']);
        $router->get('/expired', [StockAlertsController::class, 'getExpiredItems']);
        $router->get('/expiring-soon', [StockAlertsController::class, 'getExpiringSoonItems']);
        $router->get('/summary', [StockAlertsController::class, 'getStockAlertsSummary']);
        $router->get('/medicine', [StockAlertsController::class, 'getMedicineAlerts']);
        $router->get('/medicine-summary', [StockAlertsController::class, 'getMedicineAlertsSummary']);
    });

    // Medicine Taking routes
    $router->group(['prefix' => 'medicine-taking'], function () use ($router) {
        $router->get('/', [MedicineTakingController::class, 'index']);
        $router->post('/', [MedicineTakingController::class, 'store']);
        $router->get('/{id}', [MedicineTakingController::class, 'show']);
        $router->put('/{id}', [MedicineTakingController::class, 'update']);
        $router->delete('/{id}', [MedicineTakingController::class, 'destroy']);
        $router->post('/{id}/mark-taken', [MedicineTakingController::class, 'markAsTaken']);
    });

    // Medicines routes
    $router->apiResource('/medicines', MedicinesController::class);
    $router->post('/medicines/bulk-create', [MedicinesController::class, 'bulkCreate']);
    $router->get('/medicines/selection', [MedicinesController::class, 'getForSelection']);

    $router->apiResource('/expense-categories', ExpenseCategoriesController::class);
    $router->apiResource('/expenses', ExpensesController::class);
    $router->apiResource('/expense-payments', ExpensePaymentsController::class);
    $router->apiResource('/preferences', PreferencesController::class);

    $router->get('/messages', [MessagesController::class, '__invoke']);

    $router->prefix('marketing')->group(function ($router) {
        $router->get('/dashboard', [MarketingDashboardController::class, '__invoke']);
        $router->apiResource('/daily-activities', DailyActivitiesController::class);
        $router->apiResource('/ideas', IdeasController::class);
        $router->apiResource('/events', EventsController::class);
        $router->apiResource('/research-plans', ResearchPlansController::class);
        $router->apiResource('/marketing-strategies', MarketingStrategiesController::class);
        $router->apiResource('/information-sources', InformationSourcesController::class);
        $router->apiResource('/communication-logs', CommunicationLogsController::class);
        
        // Bulk SMS
        $router->apiResource('/bulk-sms', BulkSmsController::class);
        $router->post('/bulk-sms/{id}/send', [BulkSmsController::class, 'send']);
        $router->get('/bulk-sms/balance', [BulkSmsController::class, 'getBalance']);
        
        // WhatsApp Export
        $router->get('/whatsapp-export', [WhatsAppExportController::class, 'export']);
        
        // Unreachable Numbers
        $router->get('/unreachable-numbers', [UnreachableNumbersController::class, 'index']);
        
        // High Value Patients
        $router->get('/high-value-patients', [HighValuePatientsController::class, 'index']);
        
        // Prestige Clients
        $router->get('/prestige-clients', [PrestigeClientsController::class, 'index']);
        
        // Client Calling Status
        $router->get('/client-calling-status', [ClientCallingStatusController::class, 'index']);
        Route::group(["middleware" => ["auth:api"]], function ($router) {
            $router->get('/crm-report-card-data', [CrmReportCardController::class, 'getCrmReportCardData']);
        });
        $router->post('/client-calling-status/bulk-update', [ClientCallingStatusController::class, 'bulkUpdate']);
        
        // Campaign Performance
        $router->get('/campaign-performance', [CampaignPerformanceController::class, 'index']);
        
        // Lead Generation
        $router->get('/lead-generation', [LeadGenerationController::class, 'index']);
        
        // Communication Analytics
        $router->get('/communication-analytics', [CommunicationAnalyticsController::class, 'index']);
    });
    
    $router->prefix('consultation-room')->group(function ($router) {
        $router->get('/dashboard', [ConsultationRoomDashboardController::class, '__invoke']);
    });
    
    $router->prefix('optician-center')->group(function ($router) {
        $router->get('/dashboard', [OpticianCenterDashboardController::class, '__invoke']);
    });
    
    $router->prefix('sales-center')->group(function ($router) {
        $router->get('/dashboard', [SalesCenterDashboardController::class, '__invoke']);
        $router->get('/prescriptions/summary', [SalesCenterPrescriptionsController::class, 'summary']);
        $router->get('/prescriptions', [SalesCenterPrescriptionsController::class, 'index']);
    });
    
    $router->prefix('sales-management')->group(function ($router) {
        $router->get('/dashboard', [SalesManagementDashboardController::class, '__invoke']);
        $router->get('/clinical-notes', [ConsultationsController::class, 'index']);
        $router->get('/patients-sent-to-sales', [PatientPaymentCacheController::class, 'index']);
    });
    
    $router->prefix('medicine-center')->group(function ($router) {
        $router->get('/dashboard', [MedicineCenterDashboardController::class, '__invoke']);
    });

    $router->prefix('other-dispensing')->group(function ($router) {
        $router->get('/dashboard', [OtherDispensingDashboardController::class, '__invoke']);
    });

    $router->prefix('dispensing')->group(function ($router) {
        $router->get('/dashboard', [\App\Http\Controllers\DispensingDashboardController::class, '__invoke']);
    });

    $router->prefix('inventory-management')->group(function ($router) {
        $router->get('/dashboard', [InventoryManagementDashboardController::class, '__invoke']);
    });

    $router->prefix('financial-management')->group(function ($router) {
        $router->get('/dashboard', [FinancialManagementDashboardController::class, '__invoke']);
    });

    $router->prefix('procedure-room')->group(function ($router) {
        $router->get('/dashboard', [ProcedureRoomDashboardController::class, '__invoke']);
    });

    $router->prefix('reception')->group(function ($router) {
        $router->get('/dashboard', [\App\Http\Controllers\ReceptionDashboardController::class, '__invoke']);
    });

    $router->prefix('payment-center')->group(function ($router) {
        $router->get('/dashboard', [\App\Http\Controllers\PaymentCenterDashboardController::class, '__invoke']);
    });

    $router->prefix('director')->group(function ($router) {
        $router->get('/dashboard', [DirectorDashboardController::class, '__invoke']);
        $router->get('/employee-performance', [EmployeePerformanceController::class, 'index']);
    });

    $router->prefix('performance-reports')->group(function ($router) {
        $router->get('/{department}', [PerformanceDashboardController::class, 'getDepartmentKPIs']);
        $router->patch('/{department}/targets', [PerformanceDashboardController::class, 'updateTargets']);
        $router->patch('/{department}/report', [PerformanceDashboardController::class, 'updateReport']);
    });

    $router->prefix('marketing')->group(function ($router) {
        $router->controller(\App\Http\Controllers\Marketing\ClientCallingStatusController::class)->group(function ($router) {
            $router->get('/client-calling-status', 'index');
            $router->post('/client-calling-status', 'store');
            $router->match(['put', 'patch'], '/client-calling-status/{patientId}', 'update');
            $router->delete('/client-calling-status/{id}', 'destroy');
            $router->get('/client-calling-stats', 'getCallingStats');
        });
    });

    $router->prefix('reports')->group(function ($router) {
        $router->controller(PaymentCenterReportsController::class)->prefix('payment-center')->group(function ($router) {
            $router->get('/cash-collection', 'getCashCollectionReport');
            $router->get('/expenses', 'getExpenseReport');
        });
        $router->controller(InventoryManagementReportsController::class)->prefix('inventory-management')->group(function ($router) {
            $router->get('/item-quantity-dispensed', 'getItemQuantityDispensedReport');
            $router->get('/item-balance', 'getItemBalanceReport');
        });
        $router->controller(FinancialManagementReportsController::class)->prefix('financial-management')->group(function ($router) {
            $router->get('/dashboard', '__invoke');
            $router->get('/balance-sheet', 'getBalanceSheetReport');
        });
        // Sales report route removed - no longer needed
    });
});

// CRM Reports - Public endpoints for testing
Route::get('/crm-reports/marketing-contact-analytics', [CRMReportsController::class, 'marketingContactAnalytics']);
Route::get('/crm-reports/lead-conversion-report', [CRMReportsController::class, 'leadConversionReport']);

// Department Performance Report Cards
Route::group(['middleware' => 'auth:api'], function ($router) {
    $router->prefix('department-performance')->group(function ($router) {
        $router->get('/departments', [\App\Http\Controllers\DepartmentPerformanceController::class, 'getDepartments']);
        $router->get('/{department}', [\App\Http\Controllers\DepartmentPerformanceController::class, 'show']);
        $router->post('/{department}/generate', [\App\Http\Controllers\DepartmentPerformanceController::class, 'generate']);
        $router->patch('/{department}', [\App\Http\Controllers\DepartmentPerformanceController::class, 'update']);
        $router->get('/{department}/targets', [\App\Http\Controllers\DepartmentPerformanceController::class, 'getTargets']);
        $router->get('/{department}/audit-logs', [\App\Http\Controllers\DepartmentPerformanceController::class, 'getAuditLogs']);
        $router->post('/initialize', [\App\Http\Controllers\DepartmentPerformanceController::class, 'initialize']);
    });
});
