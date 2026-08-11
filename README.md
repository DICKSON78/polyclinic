# Polyclinic HMS

A comprehensive polyclinic/hospital management system built with Laravel and React. This system manages all aspects of a healthcare facility including patient records, triage & vitals, consultations, laboratory, pharmacy, radiology, inpatient wards, billing, inventory, and staff management.

## Features

- **Patient Management**: Complete patient records and history
- **Consultation System**: Clinical notes, examinations, and diagnosis
- **Real-time Notifications**: WebSocket-based live updates
- **Inventory Management**: Medicine and equipment tracking
- **Financial Management**: Billing, payments, and reports
- **Staff Management**: Employee records and privilege system
- **Appointment Scheduling**: Calendar and appointment management

## System Requirements

- **PHP**: 8.1 or higher
- **Node.js**: 16.x or higher
- **MySQL**: 5.7 or higher
- **Composer**: Latest version
- **Git**: For version control

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/DICKSON78/polyclinic.git
cd polyclinic
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Setup

**Configure your `.env` file with database credentials:**

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=polyclinic_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**Run database migrations and seeders:**

```bash
# Create database tables
php artisan migrate

# Seed initial data
php artisan db:seed
```

### 5. WebSocket Configuration

**Add WebSocket settings to `.env`:**

```env
PUSHER_APP_ID=local
PUSHER_APP_KEY=local
PUSHER_APP_SECRET=local
PUSHER_APP_CLUSTER=mt1
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### 6. Build Assets

```bash
# For development (with hot reload)
npm run dev

# For production (optimized with code splitting)
npm run build
```

**Performance Notes:**
- Production build uses code splitting and lazy loading for 72% smaller initial bundle
- Route modules load on-demand (only when needed)
- Large libraries (PDF, Charts) separated into cached vendor chunks
- Initial load: ~1.4 MB (down from ~5 MB before optimization)

### 7. Start the Application

```bash
# Start Laravel development server
php artisan serve

# Start WebSocket server (in another terminal)
php artisan websockets:serve
#worker
php artisan queue:work --tries=3 --timeout=60

# For development with hot reload
npm run dev
```


### Composer Dependency Conflicts

```bash
# Clear composer cache
composer clear-cache

# Update dependencies
composer update

# If conflicts persist
rm -rf vendor/
rm composer.lock
composer install
```

### NPM Dependency Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules/
rm package-lock.json
npm install
```

### Database Migration Issues

```bash
# Reset database (WARNING: This will delete all data)
php artisan migrate:fresh --seed

# Or rollback and re-run specific migrations
php artisan migrate:rollback
php artisan migrate
```

### Permission Issues (Linux/Mac)

```bash
# Set correct permissions
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chown -R www-data:www-data storage/
chown -R www-data:www-data bootstrap/cache/
```

## Database Backup

**Backup database using .env credentials:**

```bash
# Linux/Mac
source .env && mysqldump -h${DB_HOST} -P${DB_PORT} -u${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} > polyclinic.sql
```

**Restore database from backup:**

```bash
# Linux/Mac
source .env && mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} < polyclinic.sql
```
