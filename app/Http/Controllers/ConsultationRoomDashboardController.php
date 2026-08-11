<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\PatientPaymentCacheItem;
use App\Models\PatientWaitingTime;
use App\Models\Marketing\InformationSource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ConsultationRoomDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d'
            ]);

            $user = $request->user();
            $today = Carbon::today()->format('Y-m-d');

            // Default allow: if user missing or role unspecified, do not restrict by clinic
            if (!$user || ($user->is_admin ?? false)) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id ?? null;
            }

        // Default to last 7 days if no dates provided to show more meaningful data
        $start_date = $request->start_date ?? Carbon::now()->subDays(7)->format('Y-m-d'); // 7 days ago
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d'); // Today
        
        \Log::info('ConsultationRoomDashboard - Date Range', [
            'start_date' => $start_date,
            'end_date' => $end_date,
            'user_provided_start_date' => $request->start_date,
            'user_provided_end_date' => $request->end_date,
        ]);

        $data = [
            'summary' => [
                'total_consultations' => 0,
                'consultations_today' => 0,
                'scheduled_consultations' => 0,
                'pending_consultations' => 0,
                'completed_consultations' => 0,
                'total_patients_consulted' => 0,
                'clinical_notes_created' => 0,
                'prescriptions_written' => 0,
                'eye_examinations' => 0,
                'total_patients_seen' => 0,
                'total_patients_waiting' => 0,
                'new_patients_waiting' => 0,
                'return_patients_waiting' => 0,
                'referrals_made_today' => 0,
            ],
            'statistics' => [
                'consultations_by_status' => [],
                'consultations_by_doctor' => [],
                'top_diagnosis' => [],
                'consultations_trend' => [],
            ],
        ];

        // Total consultations
        try {
            $data['summary']['total_consultations'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error counting total consultations: ' . $e->getMessage());
            $data['summary']['total_consultations'] = 0;
        }

        // Consultations today
        try {
            $data['summary']['consultations_today'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', $today)
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error counting consultations today: ' . $e->getMessage());
            $data['summary']['consultations_today'] = 0;
        }

        // Scheduled consultations (same as pending for this context)
        try {
            $data['summary']['scheduled_consultations'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Pending')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error counting scheduled consultations: ' . $e->getMessage());
            $data['summary']['scheduled_consultations'] = 0;
        }

        // Pending consultations
        try {
            $data['summary']['pending_consultations'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Pending')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error counting pending consultations: ' . $e->getMessage());
            $data['summary']['pending_consultations'] = 0;
        }

        // Completed consultations (same as Consulted status)
        try {
            $data['summary']['completed_consultations'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Consulted')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error counting completed consultations: ' . $e->getMessage());
            $data['summary']['completed_consultations'] = 0;
        }

        // Total patients consulted
        try {
            $data['summary']['total_patients_consulted'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->distinct()
                ->count('payment_cache_item_id');
        } catch (\Exception $e) {
            \Log::error('Error counting total patients consulted: ' . $e->getMessage());
            $data['summary']['total_patients_consulted'] = 0;
        }

        // Clinical notes created (approximation based on consultations with notes)
        try {
            $data['summary']['clinical_notes_created'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereNotNull('remarks')
                ->where('remarks', '!=', '')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error counting clinical notes: ' . $e->getMessage());
            $data['summary']['clinical_notes_created'] = 0;
        }

        // Prescriptions written (approximation based on pharmacy items)
        try {
            $data['summary']['prescriptions_written'] = PatientPaymentCacheItem::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('consultation_type', function ($query) {
                    $query->where('name', 'Pharmacy');
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error counting prescriptions: ' . $e->getMessage());
            $data['summary']['prescriptions_written'] = 0;
        }

        // Eye examinations (approximation based on outpatient items)
        try {
            $data['summary']['eye_examinations'] = PatientPaymentCacheItem::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('consultation_type', function ($query) {
                    $query->whereNotIn('name', ['Pharmacy', 'Procedure']);
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error counting eye examinations: ' . $e->getMessage());
            $data['summary']['eye_examinations'] = 0;
        }

        // Consultations by status
        try {
            $data['statistics']['consultations_by_status'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get();
        } catch (\Exception $e) {
            \Log::error('Error fetching consultations by status: ' . $e->getMessage());
            $data['statistics']['consultations_by_status'] = [];
        }

        // Consultations by doctor
        try {
            $consultationsByDoctorQuery = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('consultations.created_at', '>=', $start_date)
                ->whereDate('consultations.created_at', '<=', $end_date)
                ->join('users', 'consultations.created_by', '=', 'users.id')
                ->select(
                    DB::raw("CONCAT(users.first_name, ' ', COALESCE(users.middle_name, ''), ' ', users.last_name) as doctor_name"),
                    DB::raw('count(*) as count')
                )
                ->groupBy('users.id', 'users.first_name', 'users.middle_name', 'users.last_name')
                ->orderBy('count', 'desc')
                ->limit(10);
            
            $data['statistics']['consultations_by_doctor'] = $consultationsByDoctorQuery->get();
        } catch (\Exception $e) {
            \Log::error('Error fetching consultations by doctor: ' . $e->getMessage());
            $data['statistics']['consultations_by_doctor'] = [];
        }

        // Top diagnosis
        try {
            $topDiagnosisQuery = DB::table('consultation_diagnoses')
                ->join('consultations', 'consultation_diagnoses.consultation_id', '=', 'consultations.id')
                ->join('diseases', 'consultation_diagnoses.disease_id', '=', 'diseases.id');
            
            if ($clinic_id) {
                $topDiagnosisQuery->join('users', 'consultations.created_by', '=', 'users.id')
                                  ->where('users.clinic_id', $clinic_id);
            }
            
            $data['statistics']['top_diagnosis'] = $topDiagnosisQuery
                ->whereDate('consultations.created_at', '>=', $start_date)
                ->whereDate('consultations.created_at', '<=', $end_date)
                ->select(
                    'diseases.id',
                    'diseases.name',
                    'diseases.code',
                    DB::raw('count(*) as consultations')
                )
                ->groupBy('diseases.id', 'diseases.name', 'diseases.code')
                ->orderBy('consultations', 'desc')
                ->limit(10)
                ->get();
        } catch (\Exception $e) {
            \Log::error('Error fetching top diagnosis: ' . $e->getMessage());
            $data['statistics']['top_diagnosis'] = [];
        }

        // Consultations trend (last 7 days)
        try {
            $data['statistics']['consultations_trend'] = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->format('Y-m-d');
                try {
                    $count = Consultation::query()
                        ->when($clinic_id, function ($query) use ($clinic_id) {
                            $query->whereHas('creator', function ($q) use ($clinic_id) {
                                $q->where('clinic_id', $clinic_id);
                            });
                        })
                        ->whereDate('created_at', $date)
                        ->count();
                } catch (\Exception $e) {
                    \Log::error('Error counting consultations for date ' . $date . ': ' . $e->getMessage());
                    $count = 0;
                }

                $data['statistics']['consultations_trend'][] = [
                    'date' => $date,
                    'count' => $count
                ];
            }
        } catch (\Exception $e) {
            \Log::error('Error fetching consultations trend: ' . $e->getMessage());
            $data['statistics']['consultations_trend'] = [];
        }

        // Total patients seen (using consultations_today for consistency with Today's Consultations)
        try {
            $totalPatientsSeenQuery = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', $today)
                ->count();
            
            \Log::info('ConsultationRoomDashboard - Total Patients Seen Query', [
                'start_date' => $start_date,
                'end_date' => $end_date,
                'clinic_id' => $clinic_id,
                'count' => $totalPatientsSeenQuery
            ]);
            
            $data['summary']['total_patients_seen'] = $totalPatientsSeenQuery;
        } catch (\Exception $e) {
            \Log::error('Error counting total patients seen: ' . $e->getMessage());
            $data['summary']['total_patients_seen'] = 0;
        }

        // Total patients waiting in consultation room
        try {
            $waitingQuery = PatientWaitingTime::query()
                ->whereIn('status', ['waiting', 'in_treatment'])
                ->where('current_department', 'consultation')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('patient.check_ins', function ($q) use ($clinic_id) {
                        $q->whereHas('payment_cache', function ($pcQuery) use ($clinic_id) {
                            $pcQuery->whereHas('items', function ($itemQuery) use ($clinic_id) {
                                $itemQuery->whereHas('creator', function ($userQuery) use ($clinic_id) {
                                    $userQuery->where('clinic_id', $clinic_id);
                                });
                            });
                        });
                    });
                });

            $totalWaitingCount = $waitingQuery->count();
            
            \Log::info('ConsultationRoomDashboard - Total Patients Waiting Query', [
                'clinic_id' => $clinic_id,
                'count' => $totalWaitingCount
            ]);
            
            $data['summary']['total_patients_waiting'] = $totalWaitingCount;

            // Get waiting patient IDs to check for new vs return
            $waitingPatientIds = $waitingQuery->pluck('patient_id')->toArray();

            if (!empty($waitingPatientIds)) {
                // Get patients who have previous consultations (return patients)
                try {
                    $returnPatientIds = Consultation::query()
                        ->when($clinic_id, function ($query) use ($clinic_id) {
                            $query->whereHas('creator', function ($q) use ($clinic_id) {
                                $q->where('clinic_id', $clinic_id);
                            });
                        })
                        ->whereHas('payment_cache_item.payment_cache.check_in', function ($query) use ($waitingPatientIds) {
                            $query->whereIn('patient_id', $waitingPatientIds);
                        })
                        ->where('status', 'Consulted')
                        ->whereDate('created_at', '<', $today)
                        ->join('patient_payment_cache_items', 'consultations.payment_cache_item_id', '=', 'patient_payment_cache_items.id')
                        ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                        ->join('patient_check_ins', 'patient_payment_cache.check_in_id', '=', 'patient_check_ins.id')
                        ->distinct()
                        ->pluck('patient_check_ins.patient_id')
                        ->toArray();

                    // New patients = waiting patients without previous consultations
                    $newPatientIds = array_diff($waitingPatientIds, $returnPatientIds);
                    
                    $data['summary']['new_patients_waiting'] = count($newPatientIds);
                    $data['summary']['return_patients_waiting'] = count($returnPatientIds);
                } catch (\Exception $e) {
                    \Log::error('Error fetching return patient IDs: ' . $e->getMessage());
                    $data['summary']['new_patients_waiting'] = count($waitingPatientIds);
                    $data['summary']['return_patients_waiting'] = 0;
                }
            } else {
                $data['summary']['new_patients_waiting'] = 0;
                $data['summary']['return_patients_waiting'] = 0;
            }
        } catch (\Exception $e) {
            \Log::error('Error fetching waiting patients: ' . $e->getMessage());
            $data['summary']['total_patients_waiting'] = 0;
            $data['summary']['new_patients_waiting'] = 0;
            $data['summary']['return_patients_waiting'] = 0;
        }

        // Referrals made today (patients created today with referral source)
        try {
            $referralSource = InformationSource::where('name', 'Referral')
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                })
                ->first();

            if ($referralSource) {
                $referralsCount = Patient::query()
                    ->where('info_source_id', $referralSource->id)
                    ->whereDate('created_at', $today)
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    })
                    ->count();
                
                \Log::info('ConsultationRoomDashboard - Referrals Made Today Query', [
                    'today' => $today,
                    'referral_source_id' => $referralSource->id,
                    'referral_source_name' => $referralSource->name,
                    'clinic_id' => $clinic_id,
                    'count' => $referralsCount
                ]);
                
                $data['summary']['referrals_made_today'] = $referralsCount;
            } else {
                \Log::info('ConsultationRoomDashboard - No Referral Source Found', [
                    'today' => $today,
                    'clinic_id' => $clinic_id
                ]);
                $data['summary']['referrals_made_today'] = 0;
            }
        } catch (\Exception $e) {
            \Log::error('Error fetching referrals made today: ' . $e->getMessage());
            $data['summary']['referrals_made_today'] = 0;
        }

            return $this->sendResponse($data, Response::HTTP_OK, 'Consultation room dashboard data retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('ConsultationRoomDashboardController error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return $this->sendError('An error occurred while fetching dashboard data.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
