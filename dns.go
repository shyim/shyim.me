package main

import (
	"fmt"
	"log"
	"os"

	"github.com/cloudflare/cloudflare-go"
)

func main() {
	// Construct a new API object
	api, err := cloudflare.NewWithAPIToken(os.Getenv("CF_TOKEN"))
	if err != nil {
		log.Fatal(err)
	}

	// Fetch the zone ID
	id, err := api.ZoneIDByName("shyim.me")
	if err != nil {
		log.Fatal(err)
	}

	records, err := api.DNSRecords(id, cloudflare.DNSRecord{Type: "TXT"})

	for _, record := range records {
		if (record.Name == "_dnslink.shyim.me") {
			api.DeleteDNSRecord(id, record.ID)
		}
	}

	cif := fmt.Sprintf("dnslink=/ipfs/%s/", os.Getenv("IPFS_CIF"))
	
	api.CreateDNSRecord(id, cloudflare.DNSRecord{
		Type:    "TXT",
		Name:    "_dnslink.shyim.me",
		Content: cif,
	})

	fmt.Sprintf("Changed TXT to %s", cif)
}