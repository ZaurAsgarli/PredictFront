# Django Backend Setup Guide

This document outlines the expected Django REST API structure for the PredictHub frontend.

## Overview

The frontend expects a Django REST API running on `http://localhost:8000` (configurable via `.env.local`).

## Required Django Apps

1. **Authentication App** (`auth`)
2. **Events App** (`events`)
3. **Predictions App** (`predictions`)
4. **Leaderboard App** (`leaderboard`)

## Database Models

### User Model (extend Django's AbstractUser)
```python
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    total_points = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    joined_date = models.DateTimeField(auto_now_add=True)
```

### Event Model
```python
class Event(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('resolved', 'Resolved'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    image = models.URLField(blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def participants_count(self):
        return self.predictions.values('user').distinct().count()
    
    @property
    def total_predictions(self):
        return self.predictions.count()
```

### EventOption Model
```python
class EventOption(models.Model):
    event = models.ForeignKey(Event, related_name='options', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    current_odds = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_correct = models.BooleanField(default=False)
```

### Prediction Model
```python
class Prediction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]
    
    user = models.ForeignKey(User, related_name='predictions', on_delete=models.CASCADE)
    event = models.ForeignKey(Event, related_name='predictions', on_delete=models.CASCADE)
    outcome = models.ForeignKey(EventOption, on_delete=models.CASCADE)
    confidence = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])
    stake = models.IntegerField(validators=[MinValueValidator(1)])
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reward = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Category Model
```python
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
```

## API Endpoints

### Authentication (`/api/auth/`)

#### Login
```
POST /api/auth/login/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}

Response:
{
    "token": "jwt_token_here",
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": "user@example.com",
        "total_points": 1500,
        "current_streak": 5
    }
}
```

#### Signup
```
POST /api/auth/signup/
Content-Type: application/json

{
    "username": "johndoe",
    "email": "user@example.com",
    "password": "password123"
}

Response: Same as login
```

### Events (`/api/events/`)

#### List Events
```
GET /api/events/?status=active&category=Sports&featured=true

Response:
[
    {
        "id": 1,
        "title": "Event Title",
        "description": "Description",
        "category": "Sports",
        "status": "active",
        "image": "https://example.com/image.jpg",
        "start_date": "2025-01-01T00:00:00Z",
        "end_date": "2025-12-31T23:59:59Z",
        "participants_count": 100,
        "total_predictions": 250,
        "featured": true,
        "options": [
            {
                "id": 1,
                "name": "Option A",
                "current_odds": "2.50"
            }
        ]
    }
]
```

#### Get Event Detail
```
GET /api/events/{id}/

Response: Single event object (same structure as above)
```

#### List Categories
```
GET /api/events/categories/

Response:
[
    {
        "id": 1,
        "name": "Sports",
        "description": "Sports events"
    }
]
```

### Predictions (`/api/predictions/`)

#### Create Prediction
```
POST /api/predictions/
Authorization: Bearer {token}
Content-Type: application/json

{
    "event": 1,
    "outcome": 1,
    "confidence": 75,
    "stake": 50,
    "notes": "My reasoning..."
}

Response:
{
    "id": 1,
    "event": 1,
    "event_title": "Event Title",
    "outcome": 1,
    "outcome_name": "Option A",
    "confidence": 75,
    "stake": 50,
    "notes": "My reasoning...",
    "status": "pending",
    "reward": null,
    "created_at": "2025-01-01T00:00:00Z"
}
```

#### Get User Predictions
```
GET /api/predictions/user/{userId}/
Authorization: Bearer {token}

Response: Array of prediction objects
```

#### Get Event Predictions
```
GET /api/predictions/event/{eventId}/

Response: Array of prediction objects
```

#### Get User Statistics
```
GET /api/predictions/stats/{userId}/
Authorization: Bearer {token}

Response:
{
    "total": 100,
    "won": 65,
    "lost": 30,
    "pending": 5,
    "win_rate": 68.4,
    "total_points": 1500,
    "current_streak": 5,
    "achievements": 12
}
```

### Leaderboard (`/api/leaderboard/`)

#### Global Leaderboard
```
GET /api/leaderboard/?limit=100

Response:
[
    {
        "rank": 1,
        "user_id": 1,
        "username": "johndoe",
        "total_points": 5000,
        "total_predictions": 150,
        "win_rate": 72.5,
        "current_streak": 8
    }
]
```

#### Weekly Leaderboard
```
GET /api/leaderboard/weekly/

Response: Same structure as global
```

#### Monthly Leaderboard
```
GET /api/leaderboard/monthly/

Response: Same structure as global
```

#### Get User Rank
```
GET /api/leaderboard/user/{userId}/
Authorization: Bearer {token}

Response:
{
    "rank": 42,
    "user_id": 1,
    "username": "johndoe",
    "total_points": 1500,
    "total_predictions": 100,
    "win_rate": 65.0,
    "current_streak": 3
}
```

## CORS Configuration

Make sure to configure CORS in your Django settings:

```python
# settings.py

INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Or for development:
CORS_ALLOW_ALL_ORIGINS = True
```

## Authentication Configuration

Install and configure JWT authentication:

```bash
pip install djangorestframework-simplejwt
```

```python
# settings.py

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
}
```

## Sample ViewSets

### Events ViewSet
```python
from rest_framework import viewsets
from rest_framework.decorators import action

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        featured = self.request.query_params.get('featured')
        
        if status:
            queryset = queryset.filter(status=status)
        if featured:
            queryset = queryset.filter(featured=True)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
```

### Predictions ViewSet
```python
class PredictionViewSet(viewsets.ModelViewSet):
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_predictions(self, request, user_id=None):
        predictions = Prediction.objects.filter(user_id=user_id)
        serializer = self.get_serializer(predictions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='stats/(?P<user_id>[^/.]+)')
    def stats(self, request, user_id=None):
        predictions = Prediction.objects.filter(user_id=user_id)
        total = predictions.count()
        won = predictions.filter(status='won').count()
        lost = predictions.filter(status='lost').count()
        pending = predictions.filter(status='pending').count()
        win_rate = (won / (won + lost) * 100) if (won + lost) > 0 else 0
        
        return Response({
            'total': total,
            'won': won,
            'lost': lost,
            'pending': pending,
            'win_rate': round(win_rate, 1),
            'total_points': request.user.total_points,
            'current_streak': request.user.current_streak,
            'achievements': 0  # Implement achievements system
        })
```

## Testing the API

Use tools like:
- **Postman** - For testing endpoints
- **Django Admin** - For managing data
- **Django REST Framework Browsable API** - Built-in API browser

## Next Steps

1. Set up Django project with the models above
2. Create serializers for each model
3. Implement viewsets and URLs
4. Configure authentication and CORS
5. Seed database with sample data
6. Test all endpoints
7. Update the frontend `.env.local` with your API URL

## Support

If you need help setting up the backend, refer to:
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [SimpleJWT Documentation](https://django-rest-framework-simplejwt.readthedocs.io/)

