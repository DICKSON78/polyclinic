<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserPrivilege;

class CheckPrivilege
{
    public function handle(Request $request, Closure $next, string $privilege)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = Auth::user();

        // Admin and Director have full access
        if ($user->role === 'Admin' || $user->role === 'Director' || $user->is_admin) {
            return $next($request);
        }

        // Check role-based privileges first
        $rolePrivileges = $this->getRoleFallbackPrivileges($user->role);
        if (in_array($privilege, $rolePrivileges)) {
            return $next($request);
        }

        // Check privileges set during login (array or object)
        $hasPrivilegesAttribute = array_key_exists('privileges', $user->attributes);
        $privileges = $hasPrivilegesAttribute ? $user->privileges : null;

        if ($this->privilegeGranted($privilege, $privileges)) {
            return $next($request);
        }

        // Check database privileges (column-based)
        $userPrivileges = UserPrivilege::where('user_id', $user->id)->first();
        if ($userPrivileges && isset($userPrivileges->$privilege) && $userPrivileges->$privilege == 1) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Access denied. Insufficient privileges.',
            'required_privilege' => $privilege,
            'user_privileges' => is_object($privileges) ? (array) $privileges : $privileges,
            'debug' => [
                'has_privileges_attribute' => $hasPrivilegesAttribute,
                'privileges_type' => gettype($privileges),
                'checking_privilege' => $privilege
            ]
        ], 403);
    }

    /**
     * Check whether a privilege key exists in an array or object of granted privileges.
     */
    private function privilegeGranted($privilege, $privileges)
    {
        if ($privileges === null) {
            return false;
        }

        if (is_object($privileges)) {
            $privileges = (array) $privileges;
        }

        if (!is_array($privileges)) {
            return false;
        }

        return in_array($privilege, $privileges, true) || array_key_exists($privilege, $privileges);
    }

    private function getRoleFallbackPrivileges($role)
    {
        $roleMap = [
            'Admin'            => ['*'],
            'Director'         => ['*'],
            'Receptionist'     => ['dashboard', 'reception', 'receptionist_monthly_report'],
            'Cashier'          => ['dashboard', 'payment_center', 'cashier_monthly_report', 'clear_pending_bill'],
            'Doctor'           => ['dashboard', 'consultation_room', 'optometrist_monthly_report', 'optometry_report_card'],
            'Optometrist'      => ['dashboard', 'consultation_room', 'optometrist_monthly_report', 'optometry_report_card'],
            'Optician'         => ['dashboard', 'optician_center', 'dispensing'],
            'Pharmacist'       => ['dashboard', 'medicine_center', 'dispensing'],
            'Nurse'            => ['dashboard', 'triage', 'wards', 'medicine_center', 'dispensing'],
            'Lab Technician'   => ['dashboard', 'laboratory'],
            'Radiologist'      => ['dashboard', 'radiology'],
            'Sales Manager'    => ['dashboard', 'sales_center', 'sales_management', 'sales', 'sales_manager_monthly_report', 'sales_report_card'],
            'Sales'            => ['dashboard', 'sales_center', 'sales_management', 'sales', 'sales_report_card'],
            'Storekeeper'      => ['dashboard', 'inventory_management'],
            'Inventory Manager'=> ['dashboard', 'inventory_management'],
            'Accountant'       => ['dashboard', 'financial_management'],
            'Finance Manager'  => ['dashboard', 'financial_management'],
            'HR'               => ['dashboard', 'employee_management', 'user_management'],
            'Marketing'        => ['dashboard', 'marketing', 'marketing_operations_monthly_report', 'office_calendar', 'crm_reports'],
            'Marketing Manager'=> ['dashboard', 'marketing', 'marketing_operations_monthly_report', 'office_calendar', 'crm_reports'],
        ];

        return $roleMap[$role] ?? ['dashboard'];
    }
}
