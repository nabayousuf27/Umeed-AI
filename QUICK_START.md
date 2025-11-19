# 🚀 Quick Start Guide

## Prerequisites Check ✅

- [x] Supabase database tables created (run `supabase_setup_complete.sql`)
- [x] Backend dependencies installed (`pip install -r requirements.txt`)
- [x] Frontend dependencies installed (`cd frontend && npm install`)
- [x] Environment variables set (`.env` file in root)

## 🏃 Run Everything

### Step 1: Start Backend

```bash
# Activate virtual environment
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Mac/Linux

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend should be running at: http://localhost:8000
✅ API docs at: http://localhost:8000/docs

### Step 2: Start Frontend

```bash
# In a new terminal
cd frontend
npm start
```

✅ Frontend should open at: http://localhost:3000

## 🧪 Test the Connection

1. **Check Backend Health:**
   - Visit: http://localhost:8000/health
   - Should return: `{"status": "healthy"}`

2. **Check API Docs:**
   - Visit: http://localhost:8000/docs
   - You should see all endpoints listed

3. **Test Frontend:**
   - Open: http://localhost:3000
   - Try signing up a new borrower
   - Check browser console for any errors

## 🔗 Connect Frontend to Backend

The API service is already updated! Now you need to:

1. **Update BorrowerAuthPage.jsx** - Replace mock signup/login
2. **Update LoanApplicationPage.jsx** - Replace mock loan application
3. **Update MyLoansPage.jsx** - Replace mock data
4. **Update AdminDashboardPage.jsx** - Replace mock data

See `NEXT_STEPS.md` for detailed instructions.

## 📋 Current Status

✅ **Done:**
- Database schema created
- Backend API endpoints ready
- Frontend pages created
- API service configured with interceptors

⏳ **In Progress:**
- Frontend API integration (replace mocks with real calls)

## 🆘 Troubleshooting

**Backend won't start?**
- Check `.env` file exists with Supabase credentials
- Verify virtual environment is activated
- Check port 8000 is not in use

**Frontend can't connect?**
- Verify backend is running
- Check CORS settings in `app/main.py`
- Check browser console for errors

**Database errors?**
- Verify Supabase tables exist
- Check Supabase credentials in `.env`
- Run `supabase_setup_complete.sql` again if needed

## 📚 Next Steps

See `NEXT_STEPS.md` for:
- Detailed integration steps
- Code examples
- Additional features to implement
- Deployment guide

---

**You're ready to go!** Start both servers and begin connecting the frontend to the backend! 🎉

