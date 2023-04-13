import axios from "axios";

function getAndSetCompanyCIKtickerList(
  companyCIKtickerListObj,
  setCompanyCIKtickerListObj
) {
  const companyCIKtickerListObjInLocal = JSON.parse(
    localStorage.getItem("companyCIKtickerListObjSTORED")
  );

  // First check whether client's localStorage for company name/CIK data; if found, reset state and proceed...
  // ...otherwise ping server to grab and store data in both state and localStorage for future use
  if (companyCIKtickerListObjInLocal !== null) {
    console.log("NON-NULL VALUE in localStorage, do NOT ping server");
    setCompanyCIKtickerListObj(JSON.parse(companyCIKtickerListObjInLocal));
  } else {
    // Ping endpoint on server to grab company name/CIK/ticker # from SEC list once server has parsed and constructed this object from companyCIKtickerList.json file
    // Data placed into a cache object initially (i.e. a hash table for future O(1) look-up speed) & subsequently construct a sorted array from object for user input company name auto-complete functionality
    (async () => {
      const response = await axios.get("/api/getCompanyCIKtickerList", {
        responseType: "json",
      });
      const responseObject = response.data;

      console.log("PINGING SERVER for CIK data...");

      // Store data in state and localStorage.  NOTE:  Chrome browser has 5MB localStorage limit (.json file < 500KB)
      setCompanyCIKtickerListObj(JSON.parse(responseObject));
      localStorage.setItem(
        "companyCIKtickerListObjSTORED",
        JSON.stringify(responseObject)
      );
    })();
  }
}

export default getAndSetCompanyCIKtickerList;
