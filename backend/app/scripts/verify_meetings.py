import asyncio
import httpx
import time

async def main():
    async with httpx.AsyncClient(base_url="http://localhost:8000", timeout=30.0) as client:
        # 1. Login as DM Administrator
        print("Step 1: Logging in as DM Administrator...")
        login_payload = {
            "email": "dm@gov.in",
            "password": "dmadmin2026"
        }
        res_login = await client.post("/auth/login", json=login_payload)
        print("Login Response Status:", res_login.status_code)
        assert res_login.status_code == 200, f"Login failed: {res_login.text}"
        token_data = res_login.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Logged in successfully! Token received.")

        # 2. Create a new meeting
        print("\nStep 2: Creating a new meeting...")
        ts = int(time.time())
        meeting_payload = {
            "title": f"Inter-Departmental Security Audit {ts}",
            "agenda": "Reviewing firewall policies and data compliance standard procedures.",
            "date": "2026-06-20",
            "time": "11:00",
            "venue": "Conference Hall C",
            "institution_name": "NIC Tripura",
            "department_name": "Cyber Security Division",
            "meeting_type": "Audit",
            "chairperson": "State Informatics Officer"
        }
        res_create = await client.post("/meetings/", json=meeting_payload, headers=headers)
        print("Create Meeting Status:", res_create.status_code)
        assert res_create.status_code == 201, f"Failed to create meeting: {res_create.text}"
        meeting = res_create.json()
        meeting_id = meeting["id"]
        print(f"Meeting created successfully! ID: {meeting_id}, Title: {meeting['title']}, Office: {meeting['office_name']}")
        assert meeting["status"] == "upcoming", "Initial meeting status should be upcoming."

        # 3. List meetings and verify new meeting is present
        print("\nStep 3: Listing meetings...")
        res_list = await client.get("/meetings/", headers=headers)
        print("List Meetings Status:", res_list.status_code)
        assert res_list.status_code == 200, f"Failed to list meetings: {res_list.text}"
        meetings = res_list.json()
        matching_meetings = [m for m in meetings if m["id"] == meeting_id]
        assert len(matching_meetings) > 0, "Created meeting not found in listing."
        print(f"Successfully verified: meeting found in list! Total meetings: {len(meetings)}")

        # 4. Add a guest to the meeting
        print("\nStep 4: Adding a guest to the meeting...")
        guest_payload = {
            "name": "Arindam Chakraborty",
            "phone": "9876543210",
            "email": "arindam.c@nic.in",
            "office": "NIC Sub-Office 1",
            "department": "Infrastructure",
            "designation": "Systems Analyst"
        }
        res_guest = await client.post(f"/meetings/{meeting_id}/guests", json=guest_payload, headers=headers)
        print("Add Guest Status:", res_guest.status_code)
        assert res_guest.status_code == 201, f"Failed to add guest: {res_guest.text}"
        guest = res_guest.json()
        guest_id = guest["id"]
        print(f"Guest added successfully! Guest ID: {guest_id}, Name: {guest['name']}")

        # 5. Fetch single meeting and check guest list
        print("\nStep 5: Fetching meeting details to verify guest list...")
        res_get = await client.get(f"/meetings/{meeting_id}", headers=headers)
        print("Get Meeting Status:", res_get.status_code)
        assert res_get.status_code == 200, f"Failed to fetch meeting: {res_get.text}"
        meeting_details = res_get.json()
        assert len(meeting_details["guests"]) == 1, "Guest was not added to meeting details list."
        assert meeting_details["guests"][0]["id"] == guest_id, "Guest ID mismatch in guest list."
        print("Successfully verified: guest is present in meeting details.")

        # 6. Update meeting status to ongoing
        print("\nStep 6: Updating meeting status to ongoing...")
        res_update = await client.put(f"/meetings/{meeting_id}", json={"status": "ongoing"}, headers=headers)
        print("Update Status Code:", res_update.status_code)
        assert res_update.status_code == 200, f"Failed to update meeting status: {res_update.text}"
        assert res_update.json()["status"] == "ongoing", "Status was not updated to ongoing."
        print("Status successfully transitioned to ongoing.")

        # 7. Postpone the meeting
        print("\nStep 7: Postponing the meeting...")
        postpone_payload = {
            "date": "2026-06-25",
            "time": "14:30"
        }
        res_postpone = await client.post(f"/meetings/{meeting_id}/postpone", json=postpone_payload, headers=headers)
        # Note: postponed endpoint in backend is PATCH /meetings/{meeting_id}/postpone
        # Let's check router definition. Yes! Router has PATCH /meetings/{meeting_id}/postpone
        # But wait, in verify script we can call PATCH:
        res_postpone = await client.patch(f"/meetings/{meeting_id}/postpone", json=postpone_payload, headers=headers)
        print("Postpone Status Code:", res_postpone.status_code)
        assert res_postpone.status_code == 200, f"Failed to postpone meeting: {res_postpone.text}"
        updated_meeting = res_postpone.json()
        assert updated_meeting["date"] == "2026-06-25", "Meeting date did not update."
        assert updated_meeting["time"] == "14:30", "Meeting time did not update."
        assert updated_meeting["status"] == "upcoming", "Meeting status should reset to upcoming."
        print("Meeting successfully postponed.")

        # 8. Remove the guest
        print("\nStep 8: Removing the guest from the meeting...")
        res_del_guest = await client.delete(f"/meetings/{meeting_id}/guests/{guest_id}", headers=headers)
        print("Delete Guest Status Code:", res_del_guest.status_code)
        assert res_del_guest.status_code == 204
        
        # Verify guest was removed
        res_get_2 = await client.get(f"/meetings/{meeting_id}", headers=headers)
        assert len(res_get_2.json()["guests"]) == 0, "Guest list should be empty after deletion."
        print("Guest successfully removed.")

        # 9. Delete the meeting
        print("\nStep 9: Deleting the meeting...")
        res_delete = await client.delete(f"/meetings/{meeting_id}", headers=headers)
        print("Delete Meeting Status Code:", res_delete.status_code)
        assert res_delete.status_code == 204
        
        # Verify meeting is deleted
        res_get_deleted = await client.get(f"/meetings/{meeting_id}", headers=headers)
        print("Fetch deleted meeting status code:", res_get_deleted.status_code)
        assert res_get_deleted.status_code == 403 or res_get_deleted.status_code == 404
        print("Meeting successfully deleted and access restricted.")

        print("\nAll meeting backend workflows completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
