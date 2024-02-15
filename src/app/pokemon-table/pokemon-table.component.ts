import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pokemon-table',
  templateUrl: './pokemon-table.component.html',
  styleUrls: ['./pokemon-table.component.css']
})
export class PokemonTableComponent implements OnInit {
  
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  displayedColumns: string[] = ['name'];
  pokemonList: any[] = [];
  filteredPokemonNames: string[] = [];
  filterTextControl = new FormControl();
  filterText: string = '';
  selectedPokemon: any | null = null; // Inicializa selectedPokemon como null
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pokemonCountByLetter: { [key: string]: number } = {};
  alphabetSummaryDataSource: { letter: string; count: number }[] = [];

  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getPokemonList();
    this.filterTextControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.applyFilter(value);
    });

  }

  getPokemonList(): void {
    
    const url = `${environment.apiUrl}/pokemon`;
    this.http.get<any>(url)
      .subscribe(response => {
        this.pokemonList = response.results;
        this.filteredPokemonNames = this.pokemonList.map(pokemon => pokemon.name);
        this.dataSource = new MatTableDataSource<any>(this.pokemonList);
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        this.calculateAlphabetSummary();
      });
  }

  calculateAlphabetSummary(): void {
    this.pokemonCountByLetter = this.filteredPokemonNames.reduce((acc: { [key: string]: number }, name: string) => {
      const firstLetter = name.charAt(0).toUpperCase();
      acc[firstLetter] = (acc[firstLetter] || 0) + 1;
      return acc;
    }, {});
    this.alphabetSummaryDataSource = Object.entries(this.pokemonCountByLetter).map(([letter, count]) => ({ letter, count }));
  }

  applyFilter(value: string): void {
    if (value) {
      this.dataSource.filter = value.trim().toLowerCase();
    }
  }

  displayPokemonName(pokemonName: string): string {
    return pokemonName ? pokemonName : '';
  }

  showPokemonDetails(pokemonName: string): void {
    const url = `${environment.apiUrl}/pokemon/${pokemonName}`;
    this.http.get<any>(url)
      .subscribe(response => {
        this.selectedPokemon = response;
      });
  }
}
