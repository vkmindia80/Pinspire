# Sample Posts - Created for Testing

**Created:** January 2025  
**User:** demo  
**Total Posts:** 10

---

## 📝 Draft Posts (3)

### 1. Morning Routine Post
- **Caption:** 🌟 Transform Your Morning Routine! Start your day with these 5 simple habits that successful people swear by.
- **Status:** Draft
- **Hashtags:** #MorningRoutine #ProductivityTips #HealthyLiving
- **Image:** Morning routine visual
- **AI Generated:** Yes

### 2. Breakfast Ideas Post
- **Caption:** 🍳 Quick & Healthy Breakfast Ideas! Power up your mornings with these delicious recipes that take less than 15 minutes to make.
- **Status:** Draft
- **Hashtags:** #BreakfastRecipes #HealthyEating #QuickMeals
- **Image:** Healthy breakfast
- **AI Generated:** Yes

### 3. Work From Home Post
- **Caption:** 💼 Work From Home Essentials! Create the perfect home office setup with these must-have items.
- **Status:** Draft
- **Hashtags:** #WorkFromHome #HomeOffice #ProductivityHacks
- **Image:** Home office setup
- **AI Generated:** No

---

## 📅 Scheduled Posts (3)

### 1. Plant-Based Dinner
- **Caption:** 🌿 Plant-Based Dinner Ideas! Discover 10 delicious vegan recipes that even meat-lovers will enjoy.
- **Status:** Scheduled
- **Schedule Time:** Tomorrow
- **Hashtags:** #VeganRecipes #PlantBased #HealthyDinner
- **Image:** Vegan food
- **AI Generated:** Yes

### 2. Self-Care Sunday
- **Caption:** ✨ Self-Care Sunday Ideas! Take time for yourself with these relaxing activities. Your mental health matters!
- **Status:** Scheduled
- **Schedule Time:** Next week
- **Hashtags:** #SelfCare #MentalHealth #SundayVibes #Wellness
- **Image:** Self-care activities
- **AI Generated:** Yes

### 3. Fitness Motivation
- **Caption:** 🏃‍♀️ Fitness Motivation Monday! Start your week strong with these beginner-friendly workout routines. No equipment needed!
- **Status:** Scheduled
- **Schedule Time:** Tomorrow
- **Hashtags:** #FitnessMotivation #WorkoutRoutine #HealthyLifestyle
- **Image:** Fitness workout
- **AI Generated:** No

---

## ✅ Published Posts (4)

### 1. Book Recommendations
- **Caption:** 📚 Book Recommendations for Summer! Escape into these page-turners perfect for beach reading.
- **Status:** Published
- **Published:** Yesterday
- **Hashtags:** #BookLovers #SummerReading #BookRecommendations
- **Image:** Books
- **Pinterest ID:** pin-12345
- **Boards:** 1
- **AI Generated:** Yes

### 2. DIY Home Decor
- **Caption:** 🎨 DIY Home Decor Projects! Transform your space on a budget with these creative and easy DIY ideas.
- **Status:** Published
- **Published:** 3 days ago
- **Hashtags:** #DIYHomeDecor #HomeImprovement #BudgetFriendly
- **Image:** DIY decor
- **Pinterest ID:** pin-67890
- **Boards:** 1
- **AI Generated:** Yes

### 3. Spring Fashion Trends
- **Caption:** 🌸 Spring Fashion Trends 2025! Stay ahead of the curve with these must-have styles for the season.
- **Status:** Published
- **Published:** 5 days ago
- **Hashtags:** #SpringFashion #FashionTrends #StyleInspiration
- **Image:** Fashion trends
- **Pinterest ID:** pin-11111
- **Boards:** 1
- **AI Generated:** No

### 4. Yoga for Beginners
- **Caption:** 🧘‍♀️ Yoga for Beginners! Start your yoga journey with these simple poses. Perfect for flexibility and stress relief!
- **Status:** Published
- **Published:** 7 days ago
- **Hashtags:** #YogaForBeginners #Mindfulness #HealthyLiving
- **Image:** Yoga poses
- **Pinterest ID:** pin-22222
- **Boards:** 2
- **AI Generated:** Yes

---

## 📊 Statistics

- **Total Posts:** 10
- **Draft:** 3 (30%)
- **Scheduled:** 3 (30%)
- **Published:** 4 (40%)
- **AI-Generated Captions:** 7 (70%)
- **All with Images:** 10 (100%)

---

## 🎯 How to View Posts

### Method 1: In the Dashboard (Recommended)
1. Login to http://localhost:3000
2. Use demo credentials (demo/demo123)
3. Click "Dashboard" in navigation
4. Use the filter buttons:
   - "All" - See all 10 posts
   - "Draft" - See 3 draft posts
   - "Scheduled" - See 3 scheduled posts
   - "Published" - See 4 published posts

### Method 2: Via API
```bash
# Get all posts
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}' | jq -r '.access_token')

curl -X GET http://localhost:8001/api/posts \
  -H "Authorization: Bearer $TOKEN" | jq '.posts'
```

### Method 3: Database Query
```bash
mongosh pinspire --eval "db.posts.find({status: 'draft'}).pretty()"
mongosh pinspire --eval "db.posts.find({status: 'scheduled'}).pretty()"
mongosh pinspire --eval "db.posts.find({status: 'published'}).pretty()"
```

---

## 🔧 Post Management

### Edit a Post
1. Go to Dashboard
2. Find the post you want to edit
3. Click "Edit" button
4. Make changes
5. Click "Update Post"

### Delete a Post
1. Go to Dashboard
2. Find the post
3. Click "Delete" button
4. Confirm deletion

### Change Status
- Draft → Scheduled: Edit post and add schedule time
- Draft → Published: Edit post and post to Pinterest
- Scheduled → Published: Post will auto-publish at scheduled time (in future)

---

## 📝 Post Details

### What Each Post Contains:
- **ID:** Unique identifier
- **User ID:** Linked to demo user
- **Caption:** Post text with hashtags
- **Image URL:** Unsplash image link
- **Status:** draft / scheduled / published
- **Boards:** Pinterest board IDs (for published)
- **Scheduled Time:** When to publish (for scheduled)
- **Published At:** When it was published
- **Created At:** When post was created
- **AI Flags:** Whether caption/image was AI-generated
- **Pinterest Post ID:** Pin ID (for published)

---

## ✨ Sample Post Topics

The sample posts cover popular Pinterest categories:
- 🌟 Productivity & Morning Routines
- 🍳 Food & Recipes
- 💼 Work From Home
- 🌿 Vegan & Plant-Based
- ✨ Self-Care & Wellness
- 🏃‍♀️ Fitness & Exercise
- 📚 Books & Reading
- 🎨 DIY & Home Decor
- 🌸 Fashion & Style
- 🧘‍♀️ Yoga & Mindfulness

---

**Note:** These are sample posts created for testing. All images are from Unsplash (public domain). Pinterest posting is in mock mode, so Pinterest IDs are simulated.
